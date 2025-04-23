import { handleUniverseQuery } from '../process-financial-data';
import { UniverseDataResponse } from '@/lib/models/financial-data';

describe('handleUniverseQuery', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('fetches and returns universe data successfully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ ticker: 'AAPL', total_return: 0.1, rank: 1 }],
        metadata: {
          metric: 'performance',
          sort: 'top',
          length: 1,
          start_date: '2025-01-20',
          end_date: '2025-04-20',
          generated_at: '2025-04-20T11:00:52.331991',
          row_count: 1,
          session_id: 'test-session',
        },
      }),
    } as any);

    const result = await handleUniverseQuery('https://example.com/data.json');
    expect(result.data[0].ticker).toBe('AAPL');
    expect(result.metadata.metric).toBe('performance');
  });

  it('throws if fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as any);
    await expect(handleUniverseQuery('https://example.com/data.json')).rejects.toThrow('Failed to fetch universe data');
  });
}); 