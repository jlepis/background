/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const BACKGROUND_IMAGES = [
	'/image1.jpg',
	'/image2.jpg',
	'/image3.jpg',
	'/splash.png'
	// Add more image URLs as needed
  ];
  
  export default {
	async fetch(request, env, ctx) {
	  try {
  
		// Parse the URL manually to handle the malformed input
		// let urlString = request.url;
		// if (urlString.startsWith('http://http//')) {
		//   urlString = urlString.replace('http://http//', 'http://');
		// }
  
		const jekyllUrl = env.JEKYLL_URL || "https://joseph-c-lepis.com"
    console.log('Using Jekyll URL:', jekyllUrl)

		const parsedUrl = new URL(jekyllUrl);
		console.log("url: ", parsedUrl.pathname)
		if (parsedUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
			console.log('Image request detected:', parsedUrl.pathname);

			if (BACKGROUND_IMAGES.includes(parsedUrl.pathname)) {
				let newImage;
				do {
					newImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
				} while (newImage === parsedUrl.pathname);

				const imageUrl = new URL(newImage, parsedUrl);
				console.log("looking for image: ", imageUrl.href)
				const imageResponse = await fetch(imageUrl);

				if (imageResponse.ok) {
					// If the image is found, return it
					return imageResponse;
				} else {
					console.log("image not found: ", newImage);
					// If the image is not found, return a 404
					return new Response('Image not found', { status: 404 });
				}
			}
		}
			// Fetch the resource from your Jekyll site
		let response = await fetch(parsedUrl);
		const contentType = response.headers.get('Content-Type');
		// update CORS Headers
		// Clone the response so that it's no longer immutable
		response = new Response(response.body, response);
		// Add CORS headers
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

		if (contentType && contentType.includes('text/html')) {
			let html = await response.text();
			
			// Choose a random background image
			const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
			
			html = html.replace(/<img src="splash\.png" id="fullscreen">/, '');
			// handle avatar image
			const avatarImage = new URL("headshot.png", parsedUrl);
			html = html.replace(/<img src="headshot\.png" id="avatar">/, `<img src='${avatarImage}' id="avatar">`);
			const newImageUrl = new URL(randomImage, parsedUrl);
			// Insert the style tag with the random background image
			const styleTag = `<style>body { background-image: url('${newImageUrl}'); background-size: cover; }</style>`;

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
