import { test, expect, type Page } from '@playwright/test';

/**
 * Golden-flow E2E: 회원가입 → 로그인 → 상품 선택 → 장바구니 담기 → 결제 페이지 진입.
 *
 * 실제 결제(Toss) 단계는 외부 SDK 및 PG 콜백이 필요하므로 E2E 범위에서 제외.
 * 대신 주문 페이지(/checkout)가 렌더링되고 "결제하기" 버튼이 노출되는 지점까지 검증한다.
 *
 * 검색(search-service)은 Elasticsearch 의존으로 인해 flaky하므로 별도 E2E로 분리.
 * 골든 플로우는 /products 리스트의 시드 데이터에서 첫 상품을 선택해 결정론적으로 진행한다.
 *
 * 유저는 매 실행마다 고유 이메일로 생성해 시드/이전 실행과 충돌하지 않게 한다.
 */

function uniqueUser() {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10_000).toString().padStart(4, '0');
  return {
    name: 'E2E 테스터',
    email: `e2e-${ts}-${rand}@example.com`,
    password: 'Passw0rd!E2e',
  };
}

async function signup(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto('/signup');
  await page.getByLabel('이름').fill(user.name);
  await page.getByLabel('이메일').fill(user.email);
  await page.getByLabel('비밀번호').fill(user.password);

  const submit = page.getByRole('button', { name: '회원가입' });
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL('**/login', { timeout: 15_000 });
}

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('이메일').fill(user.email);
  await page.getByLabel('비밀번호').fill(user.password);

  const submit = page.getByRole('button', { name: '로그인', exact: true });
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
}

test.describe('웹스토어 주문 골든 플로우', () => {
  test('회원가입 → 로그인 → 상품 선택 → 장바구니 담기 → 결제 페이지 진입', async ({ page }) => {
    const user = uniqueUser();

    // 1) 회원가입
    await signup(page, user);

    // 2) 로그인
    await login(page, user);

    // 3) 상품 목록 진입
    //    검색(search-service)은 별도 E2E에서 다루고, 골든 플로우는 시드 데이터에
    //    항상 노출되는 /products 리스트에서 첫 상품을 선택하는 방식으로 결정론적으로 검증한다.
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: '전체 상품' })).toBeVisible();

    // 4) 첫 상품 상세로 이동
    const productLinks = page.locator('a[href^="/products/"]').filter({
      hasNotText: '전체상품',
    });
    await expect(productLinks.first()).toBeVisible();
    await productLinks.first().click();
    await page.waitForURL(/\/products\/[0-9a-f-]{8,}$/i, { timeout: 15_000 });

    // 5) 옵션 드롭다운 열고 첫 옵션 선택
    //    드롭다운 트리거와 비활성화된 "장바구니 담기"(옵션 미선택 시 라벨이 동일)가 있어
    //    accessible name 앞부분으로 ▾ 아이콘이 붙은 트리거만 매칭한다.
    const dropdownTrigger = page.getByRole('button', { name: /^옵션을 선택하세요\s*▾$/ });
    await expect(dropdownTrigger).toBeVisible();
    await dropdownTrigger.click();

    // 드롭다운 메뉴 내의 활성 옵션 중 첫 번째 클릭 (disabled 제외)
    const firstOption = page
      .locator('button:not([disabled])')
      .filter({ hasText: /재고\s+\d+/ })
      .first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // 6) 장바구니 담기
    const addBtn = page.getByRole('button', { name: '장바구니 담기' });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // 토스트 노출 확인
    await expect(page.getByText('장바구니에 추가되었습니다.')).toBeVisible();

    // 7) 장바구니 페이지
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: '장바구니' })).toBeVisible();

    // 기본적으로 전체선택이 해제되어 있을 수 있으므로 전체선택 체크
    const selectAll = page.getByLabel('전체선택');
    if (!(await selectAll.isChecked())) {
      await selectAll.check();
    }

    // 8) 주문하기 → 체크아웃 페이지
    const orderLink = page.getByRole('link', { name: '주문하기' });
    await expect(orderLink).toBeVisible();
    await orderLink.click();
    await page.waitForURL('**/checkout**', { timeout: 15_000 });

    // 9) 체크아웃 페이지가 렌더링되고 "결제하기" 버튼이 보이는 지점까지 검증
    await expect(page.getByRole('heading', { name: '주문하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: /결제하기/ })).toBeVisible();
  });
});
