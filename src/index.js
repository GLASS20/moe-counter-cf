import themes from '../themes';

/**
 * 生成图像
 * @param {number} count
 * @param {string} theme
 * @param {number|string} length
 * @param {boolean} pixelated
 */
function genImage(count, theme, length, pixelated) {
  let nums;
  if (length === 'auto') {
    nums = count.toString().split('');
  } else {
    nums = count.toString().padStart(length, '0').split('');
  }

  const { width, height, images } = themes[theme] || themes['default'];  // 确保 theme 存在
  let x = 0; // x 轴
  const parts = nums.reduce((pre, cur) => {
    const uri = images[cur];
    const image = `<image x="${x}" y="0" width="${width}" height="${height}" href="${uri}"/>`;
    x += width;
    return pre + image;
  }, '');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<svg width="${x}" height="${height}" version="1.1"` +
    ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
    `${pixelated ? ' style="image-rendering: pixelated"' : ''}>` +
    `<title>Moe Counter</title><g>${parts}</g></svg>`
  );
}

/**
 * 处理请求并返回图像
 * @param {Request} req
 * @param {ExecutionContext} event
 */
function handleRequest(req, event) {
  return new Promise((resolve, reject) => {
    try {
      // 获取请求参数
      const url = new URL(req.url);
      const params = url.searchParams;

      const count = parseInt(params.get('count')) || 0;  // 获取 count，默认为 0
      const length = params.get('length') || '7';  // 获取 length，默认为 7
      const theme = params.get('theme') || 'gelbooru';  // 获取 theme，默认为 'gelbooru'
      const pixelated = params.get('render') === 'pixelated';  // 判断是否是像素化渲染

      // 调用生成图像函数
      const image = genImage(count, theme, length, pixelated);

      // 返回图像响应
      resolve(new Response(image, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
        },
      }));
    } catch (error) {
      reject(error); // 如果发生错误，reject
    }
  });
}

/**
 * 生成错误响应
 * @param {Request} req
 * @param {Error} error
 */
function genErrorResponse(req, error) {
  return new Response('Error generating image: ' + error.message, {
    status: 500,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(
    handleRequest(event.request, event).catch((e) => genErrorResponse(event.request, e))
  );
});
