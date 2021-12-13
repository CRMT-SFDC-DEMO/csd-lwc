import { LightningElement,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {subscribe, MessageContext} from 'lightning/messageService';
import updateDT from '@salesforce/messageChannel/UpdateDataTable__c';
import getObjectAndFields from '@salesforce/apex/dataTableController.getObjectAndFields';
import deleteRecord from '@salesforce/apex/dataTableController.deleteRecord';
import importUrl from '@salesforce/apex/dataTableController.getURL';


export default class genericDataTable extends LightningElement {
    @api title = "Riepilogo Spese";
    @api icon = "custom:custom40";
    @api columns={};
    @api sObject;
    @api fields;
    @api recordType;

    data;
    url;
    isModalOpen= false;
    currentRow;
    recordName;
    subscription;


    @wire(MessageContext)
    messageContext;

    connectedCallback(){
        this.columns = JSON.parse(this.columns);
        importUrl().then(result => {this.url = result});
        this.filldataTable();
    }

    subscribeToMessageChannel(){
        this.subscription = subscribe(this.messageContext,updateDT,(message)=>this.handleMessage(message));
    }

    handleMessage(message){
        if(message && message.recordCreated) this.refreshData();
    }
    
    refreshData(){
        getObjectAndFields({obj: this.sObject, fields: this.fields, recordType: this.recordType}).then(result=>{
            //fa una copia dei dati restituiti dalla query altrimenti l'ID non si trasforma in URL
            this.data = JSON.parse(JSON.stringify(result));
            this.data.forEach(element => {
                element.nomeDipendente = element.Dipendente__r.Name;
                //serve per la funzione deleteRow
                element.recordId = element.Id;

                element.Id = this.url + element.Id;
            });
        });
    }

    filldataTable(){
        this.subscribeToMessageChannel();
        this.refreshData();
    }
    
    handleRowActions(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                this.currentRow = row;
                this.recordName = row.Name;
                this.isModalOpen = true;
                break;
                default :
        }
    }

    closeModal(){
        this.isModalOpen = false;
    }

    deleteRow(){
        let currentRecord = [];
        currentRecord.push(this.currentRow.recordId);

        deleteRecord({recordIds: currentRecord})
        .then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: "Record Eliminato",
                message: "Record eliminato correttamente",
                variant: "success"
            }),);
            this.closeModal();
            this.filldataTable();

        })
        .catch(error =>{
            this.dispatchEvent(new ShowToastEvent({
                title: 'Errore!', 
                message: error.message, 
                variant: 'error'
            }),);
        });
    }
}