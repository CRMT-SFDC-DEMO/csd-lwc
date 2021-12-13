import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import updateDT from '@salesforce/messageChannel/UpdateDataTable__c';
import CARTELLINO_OBJECT from '@salesforce/schema/Cartellino__c';

export default class CreaCartellino extends LightningElement {
    @api title;
    @api icon;
    @api buttonText;
    @api buttonVariant;
    objectApiName = CARTELLINO_OBJECT;
    
    @wire(MessageContext)
    messageContext;
    
    handleSuccess(event) {
        const toastEvent = new ShowToastEvent({
            title: "Cartellino Inserito",
            message: "Cartellino inserito correttamente",
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        const payload = {recordCreated : true};
        publish(this.messageContext,updateDT,payload);
        this.handleReset();
        
    }

    saveAndNewClick() {
        const validityCheck = this.validateFields();
        if(validityCheck) this.template.querySelector('lightning-record-edit-form').submit(this.fields);
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
}