public with sharing class EventController {
    @AuraEnabled(cacheable=true)
    public static List<Event> getPersonalActivities() {
        // 현재 로그인한 사용자의 ID를 가져와 필터링
        Id currentUserId = UserInfo.getUserId();
        return [SELECT Id, Subject, StartDateTime, EndDateTime, CostType__c, CostAmount__c
                FROM Event
                WHERE OwnerId = :currentUserId
                ORDER BY StartDateTime ASC];
    }
    @AuraEnabled
    public static Id saveEvent(Event newEvent) {
        upsert newEvent; // Id가 있으면 업데이트, 없으면 삽입
        return newEvent.Id;
    }
    // getPersonalActivities 메서드에서 WhatId와 Location도 가져오도록 수정
    @AuraEnabled(cacheable=true)
    public static List<Event> getPersonalActivities() {
        Id currentUserId = UserInfo.getUserId();
        return [SELECT Id, Subject, StartDateTime, EndDateTime, Location, WhatId, CostType__c, CostAmount__c
                FROM Event
                WHERE OwnerId = :currentUserId
                ORDER BY StartDateTime ASC];
    }
}