import { LightningElement, api, wire } from 'lwc';
import saveEvent from '@salesforce/apex/EventController.saveEvent';
import getCostTypePicklistValues from '@salesforce/apex/EventController.getCostTypePicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EventModal extends LightningElement {
    @api eventData;

    eventRecord = {};
    modalTitle = '';
    costTypeOptions = [];

    @wire(getCostTypePicklistValues)
    wiredCostTypePicklist({ error, data }) {
        try {
            if (data) {
                this.costTypeOptions = data.map(item => ({
                    label: item.label,
                    value: item.value
                }));
            } else if (error) {
                this.showToast('오류', '비용 종류를 불러올 수 없습니다.', 'error');
            }
        } catch (e) {
            this.showToast('오류', '비용 종류 옵션 처리 중 오류가 발생했습니다.', 'error');
        }
    }

    connectedCallback() {
        try {
            if (this.eventData) {
                this.eventRecord = { ...this.eventData };

                if (typeof this.eventRecord.isNew === 'undefined') {
                    this.eventRecord.isNew = true;
                }
                this.eventRecord.WhatId = this.eventRecord.WhatId || '';
                this.eventRecord.WhoId = this.eventRecord.WhoId || '';

                if (this.eventRecord.StartDateTime) {
                    const startDate = new Date(this.eventRecord.StartDateTime);
                    this.eventRecord.StartDate = startDate.toISOString().slice(0, 10);
                    this.eventRecord.StartTime = startDate.toTimeString().slice(0, 5);
                } else {
                    this.eventRecord.StartDate = '';
                    this.eventRecord.StartTime = '';
                }

                if (this.eventRecord.EndDateTime) {
                    const endDate = new Date(this.eventRecord.EndDateTime);
                    this.eventRecord.EndDate = endDate.toISOString().slice(0, 10);
                    this.eventRecord.EndTime = endDate.toTimeString().slice(0, 5);
                } else {
                    this.eventRecord.EndDate = '';
                    this.eventRecord.EndTime = '';
                }

            } else {
                this.eventRecord = {
                    isNew: true,
                    WhatId: '',
                    WhoId: '',
                    StartDate: '',
                    StartTime: '',
                    EndDate: '',
                    EndTime: ''
                };
            }

            this.modalTitle = this.eventRecord.isNew ? '새 일정 생성' : '일정 수정';
            window.addEventListener('keydown', this.handleEscapeKey);
        } catch (error) {
            this.showToast('오류', '모달 초기화 중 오류가 발생했습니다.', 'error');
        }
    }

    disconnectedCallback() {
        try {
            window.removeEventListener('keydown', this.handleEscapeKey);
        } catch (error) {
            this.showToast('오류', '모달 정리 중 오류가 발생했습니다.', 'error');
        }
    }

    handleEscapeKey = (event) => {
        try {
            if (event.key === 'Escape') {
                this.handleCloseModal();
            }
        } catch (error) {
            this.showToast('오류', 'ESC 키로 모달 닫기 중 오류가 발생했습니다.', 'error');
        }
    }

    renderedCallback() {
        try {
            const firstInput = this.template.querySelector('lightning-input');
            if (firstInput) {
                firstInput.focus();
            }
        } catch (error) {
            this.showToast('오류', '화면 렌더링 후 작업 중 오류가 발생했습니다.', 'error');
        }
    }

    handleCostAmountInput(event) {
	const inputCmp = event.target;
	const value = inputCmp.value;

	const numericRegex = /^[0-9]*$/;

	if (!numericRegex.test(value)) {
		inputCmp.setCustomValidity('숫자만 입력 가능합니다.');
	} else {
		inputCmp.setCustomValidity('');
	}

	inputCmp.reportValidity();

	this.eventRecord = { ...this.eventRecord, Cost_Amount__c: value };
    }

    handleInputChange(event) {
        try {
            const { name, value } = event.target;
            this.eventRecord = { ...this.eventRecord, [name]: value };

            if (name === 'Cost_Amount__c') {
                this.eventRecord.Cost_Amount__c = value ? Number(value) : null;
            }
        } catch (error) {
            this.showToast('오류', '입력 값 처리 중 오류가 발생했습니다.', 'error');
        }
    }

    handleCloseModal() {
        try {
            this.dispatchEvent(new CustomEvent('closemodal'));
        } catch (error) {
            this.showToast('오류', '모달 닫기 이벤트 발생 중 오류가 발생했습니다.', 'error');
        }
    }

    async handleSaveEvent() {
        try {
            if (!this.eventRecord.Subject) {
                this.showToast('경고', '일정 제목을 입력해주세요.', 'warning');
                return;
            }
            if (!this.eventRecord.StartDate || !this.eventRecord.StartTime) {
                this.showToast('경고', '시작 날짜와 시간을 입력해주세요.', 'warning');
                return;
            }
            if (!this.eventRecord.EndDate || !this.eventRecord.EndTime) {
                this.showToast('경고', '종료 날짜와 시간을 입력해주세요.', 'warning');
                return;
            }

            if (this.eventRecord.Cost_Amount__c !== null && isNaN(this.eventRecord.Cost_Amount__c)) {
                this.showToast('경고', '비용 금액은 유효한 숫자여야 합니다.', 'warning');
                return;
            }

            const startDateTime = new Date(`${this.eventRecord.StartDate}T${this.eventRecord.StartTime}`);
            const endDateTime = new Date(`${this.eventRecord.EndDate}T${this.eventRecord.EndTime}`);

            if (startDateTime >= endDateTime) {
                this.showToast('경고', '종료 일시는 시작 일시보다 이후여야 합니다.', 'warning');
                return;
            }

            const idRegex = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;

            let validatedWhatId = this.eventRecord.WhatId;
            if (validatedWhatId && !idRegex.test(validatedWhatId)) {
                validatedWhatId = null;
                this.showToast('경고', '관련 대상(WhatId) ID 형식이 올바르지 않습니다. 비워두거나 유효한 ID를 입력해주세요.', 'warning');
            }

            let validatedWhoId = this.eventRecord.WhoId;
            if (validatedWhoId && !idRegex.test(validatedWhoId)) {
                validatedWhoId = null;
                this.showToast('경고', '담당자(WhoId) ID 형식이 올바르지 않습니다. 비워두거나 유효한 ID를 입력해주세요.', 'warning');
            }

            const eventToSave = {
                sobjectType: 'Event',
                Id: this.eventRecord.Id || null,
                Subject: this.eventRecord.Subject,
                StartDateTime: startDateTime.toISOString(),
                EndDateTime: endDateTime.toISOString(),
                Location: this.eventRecord.Location,
                WhatId: validatedWhatId,
                WhoId: validatedWhoId,
                Cost_Type__c: this.eventRecord.Cost_Type__c,
                Cost_Amount__c: this.eventRecord.Cost_Amount__c,
            };

            const result = await saveEvent({ eventJsonString: JSON.stringify(eventToSave) });

            this.dispatchEvent(new CustomEvent('eventsaved', { detail: result }));
            this.showToast('성공', '일정이 성공적으로 저장되었습니다!', 'success');

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            this.showToast('오류', '일정 저장 처리 중 오류가 발생했습니다: ' + errorMessage, 'error');
        }
    }

    showToast(title, message, variant) {
        try {
            const event = new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            });
            this.dispatchEvent(event);
        } catch (error) {
            this.showToast('오류', 'Toast 메시지 표시 중 오류가 발생했습니다.', 'error');
        }
    }

    getErrorMessage(error) {
        try {
            if (error && error.body && error.body.message) {
                return error.body.message;
            } else if (typeof error === 'string') {
                return error;
            }
            return '알 수 없는 오류가 발생했습니다.';
        } catch (e) {
            return '오류 메시지를 파싱할 수 없습니다.';
        }
    }
}
