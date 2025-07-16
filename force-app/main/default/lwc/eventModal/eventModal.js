import { LightningElement, api } from 'lwc';

export default class EventModal extends LightningElement {
    @api eventData = {}; // 부모로부터 이벤트 데이터를 받아옴 (제목, 시작/종료 시간, 비용 등)
    modalTitle = 'Create New Event'; // 모달 제목 초기값

    // 비용 종류 Picklist 옵션 (실제 Salesforce 필드에서 가져올 수도 있음)
    costTypeOptions = [
        { label: 'Transportation', value: 'Transportation' },
        { label: 'Meals', value: 'Meals' },
        { label: 'Accommodation', value: 'Accommodation' },
        { label: 'Other', value: 'Other' },
    ];

    connectedCallback() {
        if (this.eventData.id) {
            this.modalTitle = 'Edit Event'; // ID가 있으면 편집 모달
        }
        // eventData.whatId가 없으면 초기화 (새 이벤트 생성 시)
        if (!this.eventData.whatId) {
            this.eventData.whatId = null;
        }
    }

    // 입력 필드 변경 핸들러
    handleTitleChange(event) { this.eventData.title = event.target.value; }
    handleStartChange(event) { this.eventData.start = event.target.value; }
    handleEndChange(event) { this.eventData.end = event.target.value; }
    handleLocationChange(event) { this.eventData.location = event.target.value; }
    // 새로운 핸들러 추가
    handleWhatIdChange(event) { this.eventData.whatId = event.target.value; }
    handleCostTypeChange(event) { this.eventData.costType = event.target.value; }
    handleCostAmountChange(event) { this.eventData.costAmount = event.target.value; }

    handleSave() {
        // 필수 필드 유효성 검사 (예시)
        if (!this.eventData.title || !this.eventData.start || !this.eventData.end || !this.eventData.whatId) { // whatId도 필수 필드로 추가
            // 토스트 메시지 등으로 사용자에게 알림
            // 예: this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: 'Please fill in all required fields.', variant: 'error' }));
            return;
        }

        // 부모 컴포넌트로 이벤트 데이터 전달
        const saveEvent = new CustomEvent('save', {
            detail: { eventData: this.eventData }
        });
        this.dispatchEvent(saveEvent);
    }

    handleClose() {
        // 부모 컴포넌트로 모달 닫기 이벤트 전달
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
}