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

  const { width, height, images } = themes[theme];
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
export async function handleRequest(req, event) {
  // 获取请求参数
  const url = new URL(req.url);
  const params = url.searchParams;

  const count = parseInt(params.get('count')) || 0;  // 获取 count，默认为 0
  const length = params.get('length') || '7';  // 获取 length，默认为 7
  const theme = params.get('theme') || 'gelbooru';  // 获取 theme，默认为 'default'
  const pixelated = params.get('render') === 'pixelated';  // 判断是否是像素化渲染

  // 调用生成图像函数
  const image = genImage(count, theme, length, pixelated);

  // 返回图像响应
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
    },
  });
}

/**
 * Cloudflare Worker 入口
 */
export default {
  async fetch(req, event) {
    return await handleRequest(req, event);
  },
};