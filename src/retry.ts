export async function retry(func: Function) {
  try {
    return await func();
  } catch {
    return await func();
  }
}
