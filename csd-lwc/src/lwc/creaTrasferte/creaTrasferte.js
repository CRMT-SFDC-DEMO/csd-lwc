import { LightningElement,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import updateDT from '@salesforce/messageChannel/UpdateDataTable__c';
import { refreshApex } from '@salesforce/apex';
import TIMEMANAGEMENT_OBJECT from '@salesforce/schema/Time_Management__c';


export default class CreaTrasferte extends LightningElement {
    objectApiName = TIMEMANAGEMENT_OBJECT;
    @track objectInfo;
    

    @wire(MessageContext)
    messageContext;

    @wire(getObjectInfo, { objectApiName: TIMEMANAGEMENT_OBJECT })
    objectInfo;

    connectedCallback() {
        // usare il refresh alrimenti il recordTypeId non si popola correttamente (non si è ancora settato)
        refreshApex(this.objectInfo);
    }
    
    get recordTypeId() {
        if(this.objectInfo.data){
        const rtis =  this.objectInfo.data.recordTypeInfos;
        return Object.keys(rtis).find(rti => rtis[rti].name === 'Trasferte');
        }
        return null;
    }

    validateFields() {
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

    saveAndNewClick() {
        const validityCheck = this.validateFields();
        if(validityCheck){
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        }
    }

    handleSuccess() {
        const toastEvent = new ShowToastEvent({
            title: "Trasferta Inserita",
            message: "Trasferta inserita correttamente",
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        const payload = {recordCreated : true};
        publish(this.messageContext,updateDT,payload);
        this.handleReset();
    }
    
}