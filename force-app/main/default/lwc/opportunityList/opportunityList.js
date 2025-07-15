// opportunityList.js
import { LightningElement, wire } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities'; // Apex 메서드 임포트

// datatable의 컬럼 정의
const OPPORTUNITY_COLUMNS = [
    { label: 'Opportunity Name', fieldName: 'Name', type: 'text' },
    { label: 'Stage', fieldName: 'StageName', type: 'text' },
    { label: 'Amount', fieldName: 'Amount', type: 'currency' },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date' }
];

export default class OpportunityList extends LightningElement {
    columns = OPPORTUNITY_COLUMNS; // 컬럼 정의를 컴포넌트 속성으로 할당
    opportunities; // Opportunity 데이터를 저장할 변수
    error;    // 에러 발생 시 에러 정보를 저장할 변수

    // @wire 서비스를 사용하여 Apex 메서드 호출
    @wire(getOpportunities)
    wiredOpportunities({ error, data }) {
        if (data) {
            this.opportunities = data;
            this.error = undefined; // 데이터가 성공적으로 로드되면 에러는 없음
        } else if (error) {
            this.error = error; // 에러가 발생하면 에러 정보를 저장
            this.opportunities = undefined; // 데이터는 없음
            console.error('Error retrieving opportunities:', error); // 콘솔에 에러 출력
        }
    }
}