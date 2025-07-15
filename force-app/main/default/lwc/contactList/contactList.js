// contactList.js
import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts'; // Apex 메서드 임포트

// datatable의 컬럼 정의
const CONTACT_COLUMNS = [
    { label: 'First Name', fieldName: 'FirstName', type: 'text' },
    { label: 'Last Name', fieldName: 'LastName', type: 'text' },
    { label: 'Title', fieldName: 'Title', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' }
];

export default class ContactList extends LightningElement {
    columns = CONTACT_COLUMNS; // 컬럼 정의를 컴포넌트 속성으로 할당
    contacts; // Contact 데이터를 저장할 변수
    error;    // 에러 발생 시 에러 정보를 저장할 변수

    // @wire 서비스를 사용하여 Apex 메서드 호출
    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
            this.error = undefined; // 데이터가 성공적으로 로드되면 에러는 없음
        } else if (error) {
            this.error = error; // 에러가 발생하면 에러 정보를 저장
            this.contacts = undefined; // 데이터는 없음
            console.error('Error retrieving contacts:', error); // 콘솔에 에러 출력
        }
    }
}