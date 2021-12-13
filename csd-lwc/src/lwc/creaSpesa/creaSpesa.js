import { LightningElement,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import updateDT from '@salesforce/messageChannel/UpdateDataTable__c';
import SPESE_OBJECT from '@salesforce/schema/Spese__c';

export default class CreaSpesa extends LightningElement {
    objectApiName = SPESE_OBJECT;
    resetform = false;

    @wire(MessageContext)
    messageContext;

    handleSuccess() {
        const toastEvent = new ShowToastEvent({
            title: "Nota Spese Inserita",
            message: "Nota Spese inserita correttamente",
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