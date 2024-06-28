

// headshot.png = https://imagedelivery.net/qce_E24q1nd01LtdzDOvJA/7cc86372-5853-4028-e09a-44484ffe4600/public  
// splash.png = https://imagedelivery.net/qce_E24q1nd01LtdzDOvJA/165d60a9-38b0-4a86-6b07-b4aa29b7c000/public 
// image1.jpg = https://imagedelivery.net/qce_E24q1nd01LtdzDOvJA/22603289-b04e-41b1-f86d-487c7a50ad00/public
// image2.jpg = https://imagedelivery.net/qce_E24q1nd01LtdzDOvJA/48499236-103f-430e-4014-8bfc525ccc00/public
// image3.jpg = https://imagedelivery.net/qce_E24q1nd01LtdzDOvJA/8a4b00bb-de23-445f-38fb-9f62ef7adf00/public

const BACKGROUND_IMAGE_IDS = [
	'22603289-b04e-41b1-f86d-487c7a50ad00',
	'48499236-103f-430e-4014-8bfc525ccc00',
	'8a4b00bb-de23-445f-38fb-9f62ef7adf00',
	'165d60a9-38b0-4a86-6b07-b4aa29b7c000'
	// Add more image IDs as needed
  ];

const AVATAR_IMAGE_ID = "7cc86372-5853-4028-e09a-44484ffe4600"
const CLOUDFLARE_ACCOUNT_HASH = 'qce_E24q1nd01LtdzDOvJA'; 

export default {
	async fetch(request, env, ctx) {
	  try {
		const jekyllUrl = env.JEKYLL_URL || "https://joseph-c-lepis.com"
		console.log('Using Jekyll URL:', jekyllUrl)
  
		const parsedUrl = new URL(request.url);
		console.log("url: ", parsedUrl.pathname)
  
		// Function to get Cloudflare Images URL
		const getCloudflareImageUrl = (imageId) => 
		  `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/public`;
  
		if (parsedUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
		  console.log('Image request detected:', parsedUrl.pathname);
  
		  const requestedImageId = parsedUrl.pathname.split('/').pop();
		  if (BACKGROUND_IMAGE_IDS.includes(requestedImageId)) {
			let newImageId;
			do {
			  newImageId = BACKGROUND_IMAGE_IDS[Math.floor(Math.random() * BACKGROUND_IMAGE_IDS.length)];
			} while (newImageId === requestedImageId);
  
			const imageUrl = getCloudflareImageUrl(newImageId);
			console.log("looking for image: ", imageUrl);
			const imageResponse = await fetch(imageUrl);
  
			if (imageResponse.ok) {
			  return imageResponse;
			} else {
			  console.log("image not found: ", newImageId);
			  return new Response('Image not found', { status: 404 });
			}
		  }
		}
  
		// Fetch the resource from your Jekyll site
		let response = await fetch(jekyllUrl + parsedUrl.pathname + parsedUrl.search);
		const contentType = response.headers.get('Content-Type');
  
		if (contentType && contentType.includes('text/html')) {
		  let html = await response.text();
		  
		  // Choose a random background image
		  const randomImageId = BACKGROUND_IMAGE_IDS[Math.floor(Math.random() * BACKGROUND_IMAGE_IDS.length)];
		  const randomImageUrl = getCloudflareImageUrl(randomImageId);
		  
		  html = html.replace(/<img src="splash\.png" id="fullscreen">/, '');
		  
		  // handle avatar image
		  const avatarImageUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${AVATAR_IMAGE_ID}/avatar`
		  html = html.replace(/<img src="headshot\.png" id="avatar">/, `<img src="${avatarImageUrl}" id="avatar">`);
		  
		  // Insert the style tag with the random background image
		  const styleTag = `<style>body { background-image: url('${randomImageUrl}'); background-size: cover; }</style>`;
  
		  html = html.replace('</head>', `${styleTag}</head>`);
		  
		  // Return the modified HTML
		  return new Response(html, {
			headers: response.headers
		  });
		}
		
		// Return the original response for non-HTML requests
		return response;
	  } catch (error) {
		console.error('Worker error:', error);
		return new Response(`Worker error: ${error.message}`, { status: 500 });
	  }
	},
};
