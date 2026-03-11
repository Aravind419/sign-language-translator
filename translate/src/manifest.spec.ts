describe('manifest.webmanifest', () => {
  const filePath = 'manifest.webmanifest';

  it('webmanifest should be a valid JSON file', async () => {
    const res = await fetch(filePath);
    const txt = await res.text();
    expect(JSON.parse(txt)).toBeTruthy();
  });
});
