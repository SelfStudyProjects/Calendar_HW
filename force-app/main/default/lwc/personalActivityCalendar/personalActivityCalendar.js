import { LightningElement, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS'; // Static Resource 이름
import getPersonalActivities from '@salesforce/apex/EventController.getPersonalActivities';
import saveEvent from '@salesforce/apex/EventController.saveEvent'; // 이벤트 저장 Apex 메서드
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class PersonalActivityCalendar extends LightningElement {
    fullCalendarInitialized = false;
    calendar; // FullCalendar 인스턴스를 저장할 변수
    isModalOpen = false; // 모달 열림/닫힘 상태
    selectedEventData = {}; // 모달에 전달할 이벤트 데이터

    // Apex에서 가져온 이벤트를 FullCalendar 형식으로 변환하여 저장
    wiredActivities = [];

    @wire(getPersonalActivities)
    wiredGetPersonalActivities({ error, data }) {
        if (data) {
            // Apex에서 가져온 Event 데이터를 FullCalendar 이벤트 형식으로 변환
            this.wiredActivities = data.map(event => {
                return {
                    id: event.Id,
                    title: event.Subject,
                    start: event.StartDateTime,
                    end: event.EndDateTime,
                    allDay: false, // 필요에 따라 true/false 설정
                    // 추가 데이터 (모달에서 사용)
                    costType: event.CostType__c,
                    costAmount: event.CostAmount__c
                };
            });
            if (this.fullCalendarInitialized) {
                this.calendar.removeAllEvents(); // 기존 이벤트 모두 제거
                this.calendar.addEventSource(this.wiredActivities); // 새로운 이벤트 추가
            }
        } else if (error) {
            this.error = error;
            console.error('Error retrieving personal activities:', error);
            this.showToast('Error', 'Failed to load activities.', 'error');
        }
    }

    renderedCallback() {
        if (this.fullCalendarInitialized) {
            return;
        }
        this.fullCalendarInitialized = true;

        // Static Resource 로드 (JS, CSS)
        Promise.all([
            loadScript(this, FullCalendarJS + '/main.min.js'),
            loadScript(this, FullCalendarJS + '/daygrid.min.js'),
            loadScript(this, FullCalendarJS + '/timegrid.min.js'),
            loadScript(this, FullCalendarJS + '/interaction.min.js'),
            loadScript(this, FullCalendarJS + '/luxon.min.js'), // 날짜/시간 라이브러리
            loadStyle(this, FullCalendarJS + '/main.min.css')
        ])
        .then(() => {
            this.initializeCalendar();
        })
        .catch(error => {
            console.error('Error loading FullCalendar:', error);
            this.showToast('Error', 'Failed to load calendar library.', 'error');
        });
    }

    initializeCalendar() {
        const calendarEl = this.template.querySelector('.fullcalendar');
        if (calendarEl) {
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                // 기본 설정
                initialView: 'timeGridWeek', // 주별 시간 그리드 뷰 (일별 뷰로 변경 가능: 'timeGridDay')
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay' // 월, 주, 일 뷰 버튼
                },
                events: this.wiredActivities, // Apex에서 가져온 이벤트 데이터
                editable: true, // 이벤트 드래그 앤 드롭 및 크기 조절 가능
                selectable: true, // 날짜/시간 범위 선택 가능
                // 드래그 앤 드롭 및 크기 조절 콜백
                eventDrop: this.handleEventDrop.bind(this), // 이벤트 드롭 시
                eventResize: this.handleEventResize.bind(this), // 이벤트 크기 조절 시
                select: this.handleDateSelect.bind(this), // 날짜/시간 범위 선택 시 (새 일정 생성)
                eventClick: this.handleEventClick.bind(this), // 기존 이벤트 클릭 시 (편집)
                // 기타 설정
                slotMinTime: '08:00:00', // 달력 시작 시간
                slotMaxTime: '20:00:00', // 달력 종료 시간
                nowIndicator: true, // 현재 시간 표시
                navLinks: true, // 날짜 클릭 시 해당 날짜 뷰로 이동
                locale: 'ko', // 한국어 로케일 설정
                timeZone: 'Asia/Seoul' // 시간대 설정 (필요시)
            });
            this.calendar.render();
        }
    }

    // --- FullCalendar 이벤트 핸들러 ---
    handleEventDrop(info) { // 기존 이벤트 드래그 앤 드롭 시
        const event = info.event;
        this.saveCalendarEvent(event);
    }

    handleEventResize(info) { // 기존 이벤트 크기 조절 시
        const event = info.event;
        this.saveCalendarEvent(event);
    }

    handleDateSelect(info) { // 날짜/시간 범위 선택 시 (새 일정 생성)
        const startDate = info.startStr;
        const endDate = info.endStr;
        const allDay = info.allDay;

        this.selectedEventData = {
            id: null, // 새 이벤트이므로 ID 없음
            title: '',
            start: startDate,
            end: endDate,
            allDay: allDay,
            location: '', // location 초기화 추가
            whatId: null, // WhatId 초기화 추가 (새 이벤트 생성 시)
            costType: null,
            costAmount: null
        };
        this.isModalOpen = true; // 모달 열기
        this.calendar.unselect(); // 선택 영역 해제
    }

    handleEventClick(info) { // 기존 이벤트 클릭 시 (편집)
        const event = info.event;
        this.selectedEventData = {
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
            location: event.extendedProps.location, // extendedProps에서 가져옴
            whatId: event.extendedProps.whatId, // extendedProps에서 가져옴
            costType: event.extendedProps.costType, // extendedProps에서 가져옴
            costAmount: event.extendedProps.costAmount // extendedProps에서 가져옴
        };
        this.isModalOpen = true; // 모달 열기
    }

    // --- 모달 관련 핸들러 ---
    handleModalClose() {
        this.isModalOpen = false;
        this.selectedEventData = {};
    }

    async handleEventSave(event) {
        const savedEventData = event.detail.eventData;
        this.isModalOpen = false; // 모달 닫기

        try {
            // Apex saveEvent 메서드 호출
            const newEventId = await saveEvent({
                newEvent: {
                    Id: savedEventData.id, // 기존 이벤트면 ID, 새 이벤트면 null
                    Subject: savedEventData.title,
                    StartDateTime: savedEventData.start,
                    EndDateTime: savedEventData.end,
                    IsAllDayEvent: savedEventData.allDay,
                    Location: savedEventData.location, // Location 필드 추가
                    WhatId: savedEventData.whatId, // WhatId 필드 추가
                    CostType__c: savedEventData.costType,
                    CostAmount__c: savedEventData.costAmount
                }
            });

            // FullCalendar 업데이트 (새 이벤트 추가 또는 기존 이벤트 업데이트)
            if (savedEventData.id) {
                // 기존 이벤트 업데이트
                const fcEvent = this.calendar.getEventById(savedEventData.id);
                if (fcEvent) {
                    fcEvent.setProp('title', savedEventData.title);
                    fcEvent.setDates(savedEventData.start, savedEventData.end, { allDay: savedEventData.allDay });
                    fcEvent.setExtendedProp('costType', savedEventData.costType);
                    fcEvent.setExtendedProp('costAmount', savedEventData.costAmount);
                    sfcEvent.setExtendedProp('location', savedEventData.location);
                    fcEvent.setExtendedProp('whatId', savedEventData.whatId);
                }
            } else {
                // 새 이벤트 추가
                this.calendar.addEvent({
                    id: newEventId, // 새로 생성된 ID 사용
                    title: savedEventData.title,
                    start: savedEventData.start,
                    end: savedEventData.end,
                    allDay: savedEventData.allDay,
                    location: savedEventData.location,
                    whatId: savedEventData.whatId,
                    costType: savedEventData.costType,
                    costAmount: savedEventData.costAmount
                });
            }
            this.showToast('Success', 'Event saved successfully!', 'success');
            // Apex에서 Event 데이터를 다시 가져와서 달력을 새로고침하는 방법도 고려 (더 확실)
            // refreshApex(this.wiredGetPersonalActivities);

        } catch (error) {
            console.error('Error saving event:', error);
            this.showToast('Error', 'Failed to save event.', 'error');
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}