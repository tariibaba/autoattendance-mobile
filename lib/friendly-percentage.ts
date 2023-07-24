export function getFriendlyPercentage(percentage?: number) {
  console.log(`percentage: ${percentage}`);
  const result =
    percentage === 0 || percentage
      ? (percentage * 100).toFixed(0) + '%'
      : undefined;
  console.log(`result: ${result}`);
  return result;
}
