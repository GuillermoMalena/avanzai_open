// Jest test file for fetchUniverseData
// @jest-environment node
// If you see type errors, ensure @types/jest is installed: npm i --save-dev @types/jest
import { fetchUniverseData } from '../financial-api';
import { UniverseDataResponse } from '../../models/financial-data';

global.fetch = jest.fn();

describe('fetchUniverseData', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('fetches and returns universe data successfully', async () => {
    // Mock the /process_universe_query response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ presigned_url: 'https://example.com/data.json' }),
      })
      // Mock the presigned_url fetch
      .mockResolvedValueOnce({
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
      });

    const result = await fetchUniverseData({ some: 'param' });
    expect(result.data[0].ticker).toBe('AAPL');
    expect(result.metadata.metric).toBe('performance');
  });

  it('throws if presigned_url is missing', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    await expect(fetchUniverseData({})).rejects.toThrow('No presigned_url');
  });

  it('throws if API call fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });
    await expect(fetchUniverseData({})).rejects.toThrow('Universe query failed');
  });

  it('throws if presigned_url fetch fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ presigned_url: 'https://example.com/data.json' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });
    await expect(fetchUniverseData({})).rejects.toThrow('Failed to fetch universe data');
  });
}); 