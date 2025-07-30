import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FullCalendarRef from '@salesforce/resourceUrl/FullCalendar';
import ActivityIcons from '@salesforce/resourceUrl/ActivityIcons';
import getPersonalActivities from '@salesforce/apex/EventController.getPersonalActivities';
import saveEvent from '@salesforce/apex/EventController.saveEvent';

export default class PersonalActivityCalendar extends LightningElement {
    calendarInitialized = false;
    fullCalendarInstance;
    isDragInitialized = false;

    showModal = false;
    eventModalData = {};

    get vacationIconUrl() { return ActivityIcons + '/icons/vacation.png'; }
    get sickIconUrl() { return ActivityIcons + '/icons/sick.png'; }
    get educationIconUrl() { return ActivityIcons + '/icons/education.png'; }
    get businessIconUrl() { return ActivityIcons + '/icons/business.png'; }

    renderedCallback() {
        if (this.calendarInitialized) {
            return;
        }
        this.calendarInitialized = true;

        Promise.all([
            loadScript(this, FullCalendarRef + '/main.min.js'),
            loadStyle(this, FullCalendarRef + '/main.min.css'),
        ])
        .then(() => {
            this.initializeCalendar();

            if (!this.isDragInitialized) {
                this.initializeDraggableIcons();
                this.isDragInitialized = true;
            }
        })
        .catch(error => {
            this.showToast('오류', '달력 로드 중 오류 발생: ' + this.getErrorMessage(error), 'error');
        });
    }

    initializeDraggableIcons() {
        if (window.FullCalendar && window.FullCalendar.Draggable) {
            const draggableEl = this.template.querySelector('.icon-group');
            if (draggableEl) {
                window.FullCalendar.Draggable(draggableEl, {
                    itemSelector: '.icon-item',
                    eventData: function(eventEl) {
                        return {
                            title: eventEl.dataset.type,
                            create: true
                        };
                    }
                });
            } else {
                /* No specific error needed, this is for debugging when element not found */
            }
        } else {
            this.template.querySelectorAll('.icon-item').forEach(item => {
                item.addEventListener('dragstart', event => {
                    event.dataTransfer.setData('text/plain', event.currentTarget.dataset.type);
                    event.dataTransfer.setData('text/fc-event', JSON.stringify({
                        title: event.currentTarget.dataset.type
                    }));
                });
            });
        }
    }

    initializeCalendar() {
        const calendarEl = this.template.querySelector('.full-calendar');
        if (calendarEl) {
            let FullCalendarConstructor = null;

            if (window.FullCalendar && window.FullCalendar.Calendar) {
                FullCalendarConstructor = window.FullCalendar.Calendar;
            } else if (FullCalendarRef.Calendar) {
                FullCalendarConstructor = FullCalendarRef.Calendar;
            }

            if (!FullCalendarConstructor) {
                this.showToast('오류', '달력 핵심 기능을 찾을 수 없습니다. 관리자에게 문의하세요.', 'error');
                return;
            }

            this.fullCalendarInstance = new FullCalendarConstructor(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                editable: true,
                selectable: true,
                navLinks: true,
                initialDate: new Date(),
                events: this.fetchEventsAsFullCalendarEvents.bind(this),
                eventClick: this.handleEventClick.bind(this),
                select: this.handleSelect.bind(this),
                eventDrop: this.handleEventDrop.bind(this),
                eventResize: this.handleEventResize.bind(this),

                droppable: true,
                drop: this.handleExternalDrop.bind(this),

                eventContent: this.renderEventContent.bind(this),
            });
            this.fullCalendarInstance.render();
        }
    }

    fetchEventsAsFullCalendarEvents(fetchInfo, successCallback, failureCallback) {
        const idRegex = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;

        getPersonalActivities()
            .then(result => {
                const formattedEvents = result.map(eventItem => {
                    let validWhatId = eventItem.WhatId;
                    if (validWhatId && !idRegex.test(validWhatId)) {
                        validWhatId = null;
                    }

                    let validWhoId = eventItem.WhoId;
                    if (validWhoId && !idRegex.test(validWhoId)) {
                        validWhoId = null;
                    }

                    return {
                        id: eventItem.Id,
                        title: eventItem.Subject,
                        start: eventItem.StartDateTime,
                        end: eventItem.EndDateTime,
                        allDay: false,
                        extendedProps: {
                            Location: eventItem.Location,
                            WhatId: validWhatId,
                            WhoId: validWhoId,
                            Cost_Type__c: eventItem.Cost_Type__c,
                            Cost_Amount__c: eventItem.Cost_Amount__c,
                            IconType: eventItem.IconType__c
                        }
                    }
                });
                successCallback(formattedEvents);
            })
            .catch(error => {
                failureCallback(error);
                this.showToast('오류', '활동을 불러오지 못했습니다: ' + this.getErrorMessage(error), 'error');
            });
    }

    handleExternalDrop(info) {
        const droppedEventType = info.event ? info.event.title : (info.draggedEl ? info.draggedEl.dataset.type : (info.data ? info.data.get('text/plain') : ''));
        const dropDate = info.date;

        let defaultSubject = droppedEventType ? `${droppedEventType} 일정` : '새로운 일정';

        this.eventModalData = {
            Subject: defaultSubject,
            StartDateTime: dropDate.toISOString(),
            EndDateTime: dropDate.toISOString(),
            isNew: true,
            IconType__c: droppedEventType,
            WhatId: '',
            WhoId: ''
        };
        this.showModal = true;
        if (this.fullCalendarInstance) {
            this.fullCalendarInstance.unselect();
        }
    }

    handleSelect(info) {
        this.eventModalData = {
            Subject: '새로운 일정',
            StartDateTime: info.startStr,
            EndDateTime: info.endStr,
            isNew: true,
            IconType__c: '',
            WhatId: '',
            WhoId: ''
        };
        this.showModal = true;
        this.fullCalendarInstance.unselect();
    }

    handleEventClick(info) {
        const eventItem = info.event;
        const idRegex = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
        let clickedWhatId = eventItem.extendedProps.WhatId;
        if (clickedWhatId && !idRegex.test(clickedWhatId)) clickedWhatId = '';
        let clickedWhoId = eventItem.extendedProps.WhoId;
        if (clickedWhoId && !idRegex.test(clickedWhoId)) clickedWhoId = '';

        this.eventModalData = {
            Id: eventItem.id,
            Subject: eventItem.title,
            StartDateTime: eventItem.startStr,
            EndDateTime: eventItem.endStr,
            Location: eventItem.extendedProps.Location,
            WhatId: clickedWhatId,
            WhoId: clickedWhoId,
            Cost_Type__c: eventItem.extendedProps.Cost_Type__c,
            Cost_Amount__c: eventItem.extendedProps.Cost_Amount__c,
            isNew: false,
        };
        this.showModal = true;
    }

    handleEventDrop(info) {
        const eventItem = info.event;
        const idRegex = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
        let droppedWhatId = eventItem.extendedProps.WhatId;
        if (droppedWhatId && !idRegex.test(droppedWhatId)) droppedWhatId = null;
        let droppedWhoId = eventItem.extendedProps.WhoId;
        if (droppedWhoId && !idRegex.test(droppedWhoId)) droppedWhoId = null;

        const updatedEvent = {
            Id: eventItem.id,
            Subject: eventItem.title,
            StartDateTime: eventItem.startStr,
            EndDateTime: eventItem.endStr,
            Location: eventItem.extendedProps.Location,
            WhatId: droppedWhatId,
            WhoId: droppedWhoId,
            Cost_Type__c: eventItem.extendedProps.Cost_Type__c,
            Cost_Amount__c: eventItem.extendedProps.Cost_Amount__c,
            IconType__c: eventItem.extendedProps.IconType__c
        };
        this.saveEventData(updatedEvent, '일정을 성공적으로 이동했습니다.');
    }

    handleEventResize(info) {
        const eventItem = info.event;
        const idRegex = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
        let resizedWhatId = eventItem.extendedProps.WhatId;
        if (resizedWhatId && !idRegex.test(resizedWhatId)) resizedWhatId = null;
        let resizedWhoId = eventItem.extendedProps.WhoId;
        if (resizedWhoId && !idRegex.test(resizedWhoId)) resizedWhoId = null;

        const updatedEvent = {
            Id: eventItem.id,
            Subject: eventItem.title,
            StartDateTime: eventItem.startStr,
            EndDateTime: eventItem.endStr,
            Location: eventItem.extendedProps.Location,
            WhatId: resizedWhatId,
            WhoId: resizedWhoId,
            Cost_Type__c: eventItem.extendedProps.Cost_Type__c,
            Cost_Amount__c: eventItem.extendedProps.Cost_Amount__c,
            IconType__c: eventItem.extendedProps.IconType__c
        };
        this.saveEventData(updatedEvent, '일정 기간을 성공적으로 변경했습니다.');
    }

    saveEventData(eventToSave, successMessage) {
        if (eventToSave === null) {
            this.showToast('오류', '저장할 데이터가 유효하지 않습니다.', 'error');
            return;
        }

        saveEvent({ eventJsonString: JSON.stringify(eventToSave) })
            .then(() => {
                this.showToast('성공', successMessage || '일정이 성공적으로 저장되었습니다!', 'success');
                if (this.fullCalendarInstance) {
                    this.fullCalendarInstance.refetchEvents();
                }
            })
            .catch(error => {
                this.showToast('오류', '일정 저장/수정 중 오류가 발생했습니다: ' + this.getErrorMessage(error), 'error');
            });
    }

    handleEventSaved() {
        this.showModal = false;
        if (this.fullCalendarInstance) {
            this.fullCalendarInstance.refetchEvents();
        }
        this.showToast('성공', '일정이 성공적으로 저장되었습니다!', 'success');
    }

    handleCloseModal() {
        this.showModal = false;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    getErrorMessage(error) {
        if (error && error.body && error.body.message) {
            return error.body.message;
        } else if (typeof error === 'string') {
            return error;
        }
        return '알 수 없는 오류';
    }

    renderEventContent(info) {
        let contentEl = document.createElement('div');
        contentEl.classList.add('fc-event-main-content');

        let eventIconType = info.event.extendedProps.IconType__c;
        if (!eventIconType && info.event.title) {
            if (info.event.title.includes('휴가')) eventIconType = 'vacation';
            else if (info.event.title.includes('병가')) eventIconType = 'sick';
            else if (info.event.title.includes('교육')) eventIconType = 'education';
            else if (info.event.title.includes('출장')) eventIconType = 'business';
            else eventIconType = info.event.title.toLowerCase();
        }

        if (eventIconType) {
            const iconMapping = {
                'vacation': this.vacationIconUrl,
                'sick': this.sickIconUrl,
                'education': this.educationIconUrl,
                'business': this.businessIconUrl,
            };
            const iconUrl = iconMapping[eventIconType.toLowerCase()];

            if (iconUrl) {
                let iconEl = document.createElement('img');
                iconEl.src = iconUrl;
                iconEl.alt = eventIconType;
                iconEl.classList.add('event-icon');
                contentEl.prepend(iconEl);
            }
        }

        let titleEl = document.createElement('span');
        titleEl.innerText = info.event.title;
        titleEl.classList.add('fc-event-title');
        contentEl.appendChild(titleEl);

        return { domNodes: [contentEl] };
    }
}
