/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { Chat } from '../chat';

function cloneMetadata<TMetadata>(metadata: TMetadata): TMetadata {
  const chat = new Chat<any>({
    messages: [
      {
        id: 'custom',
        role: 'assistant',
        metadata,
        parts: [{ type: 'text', text: 'Custom message' }],
      },
    ],
    persistence: false,
  });

  return chat['~getServerMessages']()[0].metadata as TMetadata;
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('cloneMessageValue built-in branches', () => {
  it('detaches Set metadata from the live value', () => {
    const member = { label: 'Captured label' };
    const metadata = new Set([member]);

    const snapshot = cloneMetadata(metadata);
    const members = Array.from(snapshot);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(Set.prototype);
    expect(members).toEqual([{ label: 'Captured label' }]);
    expect(members[0]).not.toBe(member);

    member.label = 'Live label';
    metadata.add({ label: 'Late member' });

    expect(Array.from(snapshot)).toEqual([{ label: 'Captured label' }]);
  });

  it('detaches ArrayBuffer metadata from the live value', () => {
    const metadata = new ArrayBuffer(2);
    const sourceBytes = new Uint8Array(metadata);
    sourceBytes.set([1, 2]);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(ArrayBuffer.prototype);
    expect(snapshot.byteLength).toBe(2);
    expect(Array.from(new Uint8Array(snapshot))).toEqual([1, 2]);

    sourceBytes.set([9, 9]);

    expect(Array.from(new Uint8Array(snapshot))).toEqual([1, 2]);
  });

  it('detaches SharedArrayBuffer metadata from the live value', () => {
    const metadata = new SharedArrayBuffer(2);
    const sourceBytes = new Uint8Array(metadata);
    sourceBytes.set([1, 2]);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(SharedArrayBuffer.prototype);
    expect(Array.from(new Uint8Array(snapshot))).toEqual([1, 2]);

    sourceBytes.set([9, 9]);

    expect(Array.from(new Uint8Array(snapshot))).toEqual([1, 2]);
  });

  it('detaches typed array metadata from the live value', () => {
    const metadata = new Uint8Array([1, 2, 3]);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(Uint8Array.prototype);
    expect(snapshot.buffer).not.toBe(metadata.buffer);
    expect(Array.from(snapshot)).toEqual([1, 2, 3]);

    metadata.set([9, 9, 9]);

    expect(Array.from(snapshot)).toEqual([1, 2, 3]);
  });

  it('keeps the window of a typed array view over a larger buffer', () => {
    const buffer = new ArrayBuffer(8);
    const allBytes = new Uint8Array(buffer);
    allBytes.set([1, 2, 3, 4, 5, 6, 7, 8]);
    const metadata = new Uint16Array(buffer, 2, 2);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(Uint16Array.prototype);
    expect(snapshot.byteOffset).toBe(2);
    expect(snapshot.length).toBe(2);
    expect(Array.from(snapshot)).toEqual(Array.from(metadata));

    allBytes.set([9, 9, 9, 9, 9, 9, 9, 9]);

    expect(Array.from(snapshot)).not.toEqual(Array.from(metadata));
  });

  it('detaches DataView metadata from the live value', () => {
    const buffer = new ArrayBuffer(4);
    const metadata = new DataView(buffer, 1, 2);
    metadata.setUint8(0, 7);
    metadata.setUint8(1, 8);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(DataView.prototype);
    expect(snapshot.buffer).not.toBe(metadata.buffer);
    expect(snapshot.byteOffset).toBe(1);
    expect(snapshot.byteLength).toBe(2);
    expect([snapshot.getUint8(0), snapshot.getUint8(1)]).toEqual([7, 8]);

    metadata.setUint8(0, 9);

    expect(snapshot.getUint8(0)).toBe(7);
  });

  it('detaches URL metadata from the live value', () => {
    const metadata = new URL('https://example.com/search?query=captured#top');

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(URL.prototype);
    expect(snapshot.href).toBe('https://example.com/search?query=captured#top');

    metadata.hash = '#live';
    metadata.searchParams.set('query', 'live');

    expect(snapshot.href).toBe('https://example.com/search?query=captured#top');
  });

  it('detaches URLSearchParams metadata from the live value', () => {
    const metadata = new URLSearchParams([
      ['facet', 'brand'],
      ['facet', 'color'],
    ]);

    const snapshot = cloneMetadata(metadata);

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(URLSearchParams.prototype);
    // `append` rather than `set`, so repeated keys survive the copy.
    expect(snapshot.getAll('facet')).toEqual(['brand', 'color']);

    metadata.append('facet', 'size');

    expect(snapshot.getAll('facet')).toEqual(['brand', 'color']);
  });

  it('detaches File metadata from the live value', async () => {
    const label = { text: 'Captured label' };
    const metadata = new File(['Captured content'], 'captured.txt', {
      lastModified: 1234,
      type: 'text/plain',
    });
    (metadata as File & { label: typeof label }).label = label;

    const snapshot = cloneMetadata(metadata) as File & { label: typeof label };

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(File.prototype);
    expect(snapshot.name).toBe('captured.txt');
    expect(snapshot.type).toBe('text/plain');
    expect(snapshot.lastModified).toBe(1234);
    await expect(readBlob(snapshot)).resolves.toBe('Captured content');

    label.text = 'Live label';

    expect(snapshot.label).not.toBe(label);
    expect(snapshot.label.text).toBe('Captured label');
  });

  it('detaches Blob metadata from the live value', async () => {
    const label = { text: 'Captured label' };
    const metadata = new Blob(['Captured content'], { type: 'text/plain' });
    (metadata as Blob & { label: typeof label }).label = label;

    const snapshot = cloneMetadata(metadata) as Blob & { label: typeof label };

    expect(snapshot).not.toBe(metadata);
    expect(Object.getPrototypeOf(snapshot)).toBe(Blob.prototype);
    expect(snapshot.type).toBe('text/plain');
    expect(snapshot.size).toBe(metadata.size);
    await expect(readBlob(snapshot)).resolves.toBe('Captured content');

    label.text = 'Live label';

    expect(snapshot.label).not.toBe(label);
    expect(snapshot.label.text).toBe('Captured label');
  });
});
