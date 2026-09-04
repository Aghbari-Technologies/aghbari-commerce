import { beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();
const getSession = vi.fn();
const rpc = vi.fn();
const enqueueOfflineOperation = vi.fn();

vi.mock('../lib/supabase', () => ({
  requireSupabase: () => ({ auth: { getUser, getSession }, rpc })
}));

vi.mock('./offlineQueue', () => ({
  drainOfflineOperations: vi.fn(),
  enqueueOfflineOperation,
  OFFLINE_CART_REMOVE_ITEM: 'cart:remove_item',
  OFFLINE_CART_SET_ITEM: 'cart:set_item'
}));

describe('offline cart identity boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', { onLine: false });
    getSession.mockResolvedValue({
      data: { session: { user: { id: '11111111-1111-4111-8111-111111111111' } } },
      error: null
    });
    getUser.mockRejectedValue(new Error('network unavailable'));
  });

  it('uses the locally persisted session identity for offline cart writes', async () => {
    const { setCartItem } = await import('./cart');
    await setCartItem('33333333-3333-4333-8333-333333333333', 2);
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(getUser).not.toHaveBeenCalled();
    expect(enqueueOfflineOperation).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'cart:set_item',
      { productId: '33333333-3333-4333-8333-333333333333', quantity: 2 }
    );
    expect(rpc).not.toHaveBeenCalled();
  });
});
