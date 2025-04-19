async function importAllImages() {
  const imported = import.meta.glob('./monsters/*.png');
  const resolved = await Promise.all(Object.values(imported).map((i) => i()));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return resolved.reduce<Record<number, string>>((a, t: any) => {
    const imagePath = t.default;
    a[parseInt(imagePath.replace('/src/img/monsters/', '').replace('.png', ''))] = imagePath;
    return a;
  }, {});
}

export const MONSTER_PART = await importAllImages();
