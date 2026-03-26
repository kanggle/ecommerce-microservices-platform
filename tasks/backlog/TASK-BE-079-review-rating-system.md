# Task ID

TASK-BE-079

# Title

리뷰/평점 시스템 — 상품 리뷰 작성, 평점 관리, 평균 평점 집계

# Status

backlog

# Owner

backend

# Task Tags

- code
- api
- event

---

# Goal

사용자가 구매한 상품에 대해 리뷰를 작성하고 평점을 남길 수 있는 기능을 구현한다.

상품별 평균 평점을 집계하여 검색 및 상품 조회 시 반영한다.

---

# Scope

## In Scope

- review-service 신규 서비스 부트스트랩 (또는 product-service 확장)
- 리뷰 작성/수정/삭제 API
- 리뷰 목록 조회 API (상품별, 페이지네이션)
- 평점 집계 및 상품 평균 평점 반영
- ReviewCreated 이벤트 발행 (검색 인덱스 반영)
- 구매 확인 후 리뷰 작성 가능 제한

## Out of Scope

- 리뷰 이미지 업로드
- 리뷰 신고/관리자 삭제
- 프론트엔드 UI (별도 FE 태스크)

---

# Acceptance Criteria

- [ ] 구매한 상품에 대해 리뷰 작성 가능
- [ ] 리뷰 수정 및 삭제 동작
- [ ] 상품별 리뷰 목록 페이지네이션 조회
- [ ] 상품 평균 평점 자동 집계
- [ ] 미구매 상품 리뷰 작성 차단
- [ ] 검색 서비스에 평점 데이터 반영

---

# Related Specs

- `specs/platform/architecture-decision-rule.md`
- `specs/platform/service-boundaries.md`
- `specs/services/product-service/architecture.md`
- (review-service 스펙 작성 필요)

# Related Skills

- `.claude/skills/backend/`

---

# Related Contracts

- (review API 계약 작성 필요)
- `specs/contracts/http/product-api.md`
- `specs/contracts/http/order-api.md` (구매 확인)
- `specs/contracts/events/product-events.md`

---

# Target Service

- `review-service` (신규) 또는 `product-service` (확장)

---

# Architecture

- 서비스 아키텍처 결정 필요

---

# Implementation Notes

- ready로 이동 전 서비스 경계 결정 및 스펙/계약 작성 필요
- product-service와 search-service 연동 방식 설계 필요

---

# Edge Cases

- 동일 상품에 대한 중복 리뷰 방지
- 주문 취소/환불 후 리뷰 처리
- 탈퇴한 사용자의 리뷰 표시

---

# Failure Scenarios

- 구매 확인 API 장애 시 리뷰 작성 불가
- 평점 집계 이벤트 처리 실패
- 검색 인덱스 동기화 지연

---

# Test Requirements

- unit test
- integration test

---

# Definition of Done

- [ ] Implementation completed
- [ ] Tests added
- [ ] Tests passing
- [ ] Contracts updated if needed
- [ ] Specs updated first if required
- [ ] Ready for review
