<template>
    <lightning-card title="Dashboard" icon-name="standard:dashboard" class="main-dashboard-card">
        <div class="main-dashboard-content">
            <!-- 휴가, 병가, 교육, 출장 버튼들 -->
            <div class="activity-icons-section">
                <div class="icon-group">
                    <div class="icon-item" data-type="vacation" title="휴가">
                        <img src={vacationIconUrl} alt="휴가" />
                        <span>vacation</span>
                    </div>
                    <div class="icon-item" data-type="sick" title="병가">
                        <img src={sickIconUrl} alt="병가" />
                        <span>sick</span>
                    </div>
                    <div class="icon-item" data-type="education" title="교육">
                        <img src={educationIconUrl} alt="교육" />
                        <span>education</span>
                    </div>
                    <div class="icon-item" data-type="business" title="출장">
                        <img src={businessIconUrl} alt="출장" />
                        <span>business</span>
                    </div>
                </div>
            </div>

            
            <div class="dashboard-layout">
                <!-- 좌측 탭 영역 -->
                <div class="dashboard-tabs-section">
                    <lightning-tabset variant="scoped" onactive={handleTabChange}>
                        <lightning-tab label="Accounts" value="accounts">
                            <div class="slds-p-around_medium tab-content-scroll">
                                <div class="data-list">
                                    <template for:each={accountData} for:item="account">
                                        <div key={account.Id} 
                                             class="draggable-item slds-box slds-m-bottom_x-small" 
                                             draggable="true"
                                             ondragstart={handleDragStart}
                                             data-type="account"
                                             data-id={account.Id}
                                             data-name={account.Name}
                                             data-info={account.Industry}>
                                            <div class="slds-media">
                                                <div class="slds-media__figure">
                                                    <lightning-icon icon-name="standard:account" size="small"></lightning-icon>
                                                </div>
                                                <div class="slds-media__body">
                                                    <div class="slds-text-heading_small">{account.Name}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">{account.Industry}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">Annual Revenue: {account.AnnualRevenue}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </lightning-tab>
                        <lightning-tab label="Contacts" value="contacts">
                            <div class="slds-p-around_medium tab-content-scroll">
                                <div class="data-list">
                                    <template for:each={contactData} for:item="contact">
                                        <div key={contact.Id} 
                                             class="draggable-item slds-box slds-m-bottom_x-small" 
                                             draggable="true"
                                             ondragstart={handleDragStart}
                                             data-type="contact"
                                             data-id={contact.Id}
                                             data-name={contact.Name}
                                             data-info={contact.Title}>
                                            <div class="slds-media">
                                                <div class="slds-media__figure">
                                                    <lightning-icon icon-name="standard:contact" size="small"></lightning-icon>
                                                </div>
                                                <div class="slds-media__body">
                                                    <div class="slds-text-heading_small">{contact.Name}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">{contact.Title}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">{contact.Email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </lightning-tab>
                        <lightning-tab label="Opportunities" value="opportunities">
                            <div class="slds-p-around_medium tab-content-scroll">
                                <div class="data-list">
                                    <template for:each={opportunityData} for:item="opportunity">
                                        <div key={opportunity.Id} 
                                             class="draggable-item slds-box slds-m-bottom_x-small" 
                                             draggable="true"
                                             ondragstart={handleDragStart}
                                             data-type="opportunity"
                                             data-id={opportunity.Id}
                                             data-name={opportunity.Name}
                                             data-info={opportunity.StageName}>
                                            <div class="slds-media">
                                                <div class="slds-media__figure">
                                                    <lightning-icon icon-name="standard:opportunity" size="small"></lightning-icon>
                                                </div>
                                                <div class="slds-media__body">
                                                    <div class="slds-text-heading_small">{opportunity.Name}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">Stage: {opportunity.StageName}</div>
                                                    <div class="slds-text-body_small slds-text-color_weak">Amount: {opportunity.Amount}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </lightning-tab>
                    </lightning-tabset>
                </div>

                <!-- 우측 캘린더 영역 -->
                <div class="calendar-section">
                    <lightning-card title="Calendar" icon-name="standard:event" class="calendar-card">
                        <div class="slds-p-around_medium calendar-content">
                            <div class="calendar-header">
                                <div class="slds-grid slds-grid_align-spread slds-m-bottom_medium">
                                    <div class="slds-col">
                                        <lightning-button-icon 
                                            icon-name="utility:chevronleft" 
                                            onclick={previousMonth}
                                            alternative-text="Previous Month">
                                        </lightning-button-icon>
                                        <span class="slds-text-heading_medium slds-m-horizontal_small">
                                            {currentMonthYear}
                                        </span>
                                        <lightning-button-icon 
                                            icon-name="utility:chevronright" 
                                            onclick={nextMonth}
                                            alternative-text="Next Month">
                                        </lightning-button-icon>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="calendar-grid">
                                <!-- 요일 헤더 -->
                                <div class="calendar-weekdays">
                                    <template for:each={weekdays} for:item="day">
                                        <div key={day} class="weekday-header">{day}</div>
                                    </template>
                                </div>
                                
                                <!-- 캘린더 날짜 -->
                                <div class="calendar-days">
                                    <template for:each={calendarDays} for:item="day">
                                        <div key={day.key} 
                                             class={day.cssClass}
                                             ondragover={handleDragOver}
                                             ondrop={handleDrop}
                                             ondragleave={handleDragLeave}
                                             data-date={day.date}>
                                            <span class="day-number">{day.dayNumber}</span>
                                            <template if:true={day.events}>
                                                <template for:each={day.events} for:item="event">
                                                    <div key={event.id} class="calendar-event">
                                                        <lightning-icon icon-name={event.icon} size="xx-small"></lightning-icon>
                                                        <span class="event-text">{event.title}</span>
                                                    </div>
                                                </template>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </lightning-card>
                </div>
            </div>

            <!-- 비용 집계 요약 영역 -->
            <div class="cost-summary-section">
                <lightning-card title="Cost Summary" icon-name="standard:money" class="cost-summary-inner-card">
                    <div class="slds-p-around_medium cost-summary-content-scroll">
                        <c-cost-analysis></c-cost-analysis>
                    </div>
                </lightning-card>
            </div>
        </div>
    </lightning-card>

    <!-- EventModal과 동일한 모달 -->
    <template if:true={showModal}>
        <section role="dialog" tabindex="-1" aria-modal="true" class="slds-modal slds-fade-in-open slds-modal_medium">
            <div class="slds-modal__container">
                <lightning-modal-header title={modalTitle}></lightning-modal-header>
                <lightning-modal-body class="slds-p-around_medium">
                    <lightning-input
                        label="Title"
                        name="Subject"
                        value={eventRecord.Subject}
                        onchange={handleInputChange}
                        class="slds-m-bottom_small"
                        required
                        autofocus>
                    </lightning-input>

                    <div class="slds-grid slds-gutters slds-m-bottom_small">
                        <div class="slds-col slds-size_1-of-2">
                            <lightning-input
                                type="date"
                                label="Start Date"
                                name="StartDate"
                                value={eventRecord.StartDate}
                                onchange={handleInputChange}
                                required>
                            </lightning-input>
                        </div>
                        <div class="slds-col slds-size_1-of-2">
                            <lightning-input
                                type="time"
                                label="Start Time"
                                name="StartTime"
                                value={eventRecord.StartTime}
                                onchange={handleInputChange}
                                required>
                            </lightning-input>
                        </div>
                    </div>

                    <div class="slds-grid slds-gutters slds-m-bottom_small">
                        <div class="slds-col slds-size_1-of-2">
                            <lightning-input
                                type="date"
                                label="End Date"
                                name="EndDate"
                                value={eventRecord.EndDate}
                                onchange={handleInputChange}
                                required>
                            </lightning-input>
                        </div>
                        <div class="slds-col slds-size_1-of-2">
                            <lightning-input
                                type="time"
                                label="End Time"
                                name="EndTime"
                                value={eventRecord.EndTime}
                                onchange={handleInputChange}
                                required>
                            </lightning-input>
                        </div>
                    </div>

                    <lightning-input
                        label="Location"
                        name="Location"
                        value={eventRecord.Location}
                        onchange={handleInputChange}
                        class="slds-m-bottom_medium">
                    </lightning-input>

                    <h3 class="slds-text-heading_small slds-m-top_medium slds-m-bottom_small">관련 레코드</h3>
                    <lightning-input
                        label="Account ID"
                        name="WhatId"
                        value={eventRecord.WhatId}
                        onchange={handleInputChange}
                        class="slds-m-bottom_small"
                        placeholder="예: 001XXXXXXXXXXXXXXX (거래처 ID)">
                    </lightning-input>

                    <lightning-input
                        label="Contact ID"
                        name="WhoId"
                        value={eventRecord.WhoId}
                        onchange={handleInputChange}
                        class="slds-m-bottom_medium"
                        placeholder="예: 003XXXXXXXXXXXXXXX (연락처 ID)">
                    </lightning-input>

                    <h3 class="slds-text-heading_small slds-m-top_medium slds-m-bottom_small">비용 상세</h3>
                    <lightning-combobox
                        label="Cost Type"
                        name="Cost_Type__c"
                        value={eventRecord.Cost_Type__c}
                        options={costTypeOptions}
                        onchange={handleInputChange}
                        placeholder="비용 종류를 선택하세요"
                        class="slds-m-bottom_small">
                    </lightning-combobox>
                    <lightning-input
                        type="text"
                        label="Cost Amount"
                        name="Cost_Amount__c"
                        value={eventRecord.Cost_Amount__c}
                        oninput={handleCostAmountInput}
                        class="slds-m-bottom_medium">
                    </lightning-input>
                </lightning-modal-body>

                <lightning-modal-footer>
                    <lightning-button label="취소" onclick={closeModal} class="slds-m-right_small"></lightning-button>
                    <lightning-button label="저장" variant="brand" onclick={saveEvent}></lightning-button>
                </lightning-modal-footer>
            </div>
        </section>
        <div class="slds-backdrop slds-backdrop_open"></div>
    </template>
</template>
