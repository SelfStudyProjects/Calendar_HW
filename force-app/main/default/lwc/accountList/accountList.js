import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts'; // Apex 메서드 임포트

// datatable의 컬럼 정의
const COLUMNS = [
    { label: 'Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' }
];

export default class AccountList extends LightningElement {
    columns = COLUMNS; // 컬럼 정의를 컴포넌트 속성으로 할당
    accounts; // Account 데이터를 저장할 변수
    error;    // 에러 발생 시 에러 정보를 저장할 변수

    // @wire 서비스를 사용하여 Apex 메서드 호출
    // getAccounts 메서드가 반환하는 데이터를 accounts 변수에 할당하거나 error 변수에 할당
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
            this.error = undefined; // 데이터가 성공적으로 로드되면 에러는 없음
        } else if (error) {
            this.error = error; // 에러가 발생하면 에러 정보를 저장
            this.accounts = undefined; // 데이터는 없음
            console.error('Error retrieving accounts:', error); // 콘솔에 에러 출력
        }
    }
}