import { LightningElement,api,wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import updateDT from '@salesforce/messageChannel/UpdateDataTable__c';
import TIMEMANAGEMENT_OBJECT from '@salesforce/schema/Time_Management__c';
import { refreshApex } from '@salesforce/apex';

export default class GenericCreaRecord extends LightningElement {
    @api sObject = TIMEMANAGEMENT_OBJECT;
    @api title = "Crea Record";
    @api icon = "standard:form"; 
    @api fields = {}; 
    @api recordType;
    fieldListArr;
    
    @wire(MessageContext)
    messageContext;
    @wire(getObjectInfo, { objectApiName: TIMEMANAGEMENT_OBJECT })
    objectInfo;
    
    get recordTypeId(){
        if(this.objectInfo.data){
            const rtis =  this.objectInfo.data.recordTypeInfos;
            return Object.keys(rtis).find(rti => rtis[rti].name === this.recordType);
        }
        return null;
    }  
    
     connectedCallback(){
        this.fields = JSON.parse(this.fields);
        console.log(this.fields);
        this.fieldListArr = Object.values(this.fields);
        refreshApex(this.objectInfo);
    }

    validateFields(){
        let flag = true;
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            if(!element.reportValidity()) flag = false;
        });
        return flag;
    }

    handleReset(){
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }


    saveAndNewClick(){
        const validityCheck = this.validateFields();
        console.log(validityCheck);
        if(validityCheck){
        this.template.querySelector('lightning-record-edit-form').submit();
        }
    }
    
    handleSuccess(){
        const toastEvent = new ShowToastEvent({
            title: this.recordType + " creato!",
            message: this.recordType + " inserito correttamente",
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        const payload = {recordCreated : true};
        publish(this.messageContext,updateDT,payload);
        this.handleReset();
    }
    
    
}