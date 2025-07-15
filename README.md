# Salesman's Calendar : 개인 일정 및 비용 관리 시스템

## 소개  
이 프로젝트는 세일즈포스 플랫폼을 기반으로 Account, Contact, Opportunity 데이터 조회와 개인 일정 관리 기능을 구현하는 애플리케이션입니다.  
사용자는 개인 일정을 달력에서 확인하고, 드래그 앤 드롭으로 일정을 생성할 수 있으며, 비용 정보를 입력하고 부서별, 비용 종류별로 집계된 보고서를 확인할 수 있습니다.

## 주요 기능  
- Account, Contact, Opportunity 탭별 데이터 목록 조회  
- Personal Activity 영역에서 휴가, 병가, 출장 등 개인 일정 관리  
- FullCalendar 기반 달력에서 드래그 앤 드롭 일정 생성 및 수정  
- 이벤트에 비용(Cost) 필드 추가 및 비용 종류별 관리  
- 부서별, 비용 종류별 매트릭스 타입 비용 집계 보고서 제공  

## 개발 환경  
- Salesforce Lightning Web Component (LWC)  
- FullCalendar 라이브러리  
- VS Code, Salesforce CLI, Node.js, npm

## 설치 및 실행 방법  
1. Salesforce DX 프로젝트 클론 및 환경 설정  
2. 필요한 패키지 설치: `npm install`  
3. Salesforce Org에 메타데이터 배포: `sfdx force:source:deploy`  
4. 테스트 클래스 실행 및 검증  
5. 로컬에서 LWC 컴포넌트 개발 및 디버깅

## 문서  
- 요구사항 정의서 (Requirements.md)  
- 화면 정의서 (UI-Design.md)  
- 스프린트 백로그 (Sprint-Backlog.xlsx)

## 기여 방법  
- Fork 후 브랜치 생성  
- 기능별 커밋 및 푸시  
- Pull Request 생성 및 코드 리뷰 요청

## 라이선스  
이 프로젝트는 DKBMC(주) 세일즈포스 릴리즈 노트 및 MIT 라이선스를 따릅니다.