const BACKGROUND_IMAGE_IDS = [
	'22603289-b04e-41b1-f86d-487c7a50ad00',
	'48499236-103f-430e-4014-8bfc525ccc00',
	'8a4b00bb-de23-445f-38fb-9f62ef7adf00',
	'165d60a9-38b0-4a86-6b07-b4aa29b7c000'
	// Add more image IDs as needed
  ];

const AVATAR_IMAGE_ID = "468a29eb-b00d-4050-a1a4-40a8c1db8a00"

export default {
	async fetch(request, env, ctx) {
	  try {
      const CLOUDFLARE_ACCOUNT_HASH = env.IMAGE_ACCOUNT_HASH;   
      const jekyllUrl = env.JEKYLL_URL || "https://jlepis.github.io"
  
      const parsedUrl = new URL(request.url);
      console.log("url: ", parsedUrl.pathname)
    
      // Function to get Cloudflare Images URL
      const getCloudflareImageUrl = (imageId) => 
        `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/public`;
    
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
        // const styleTag = `<style>body { background-image: url('${randomImageUrl}'); background-size: cover; }</style>`;
    
        console.log(randomImageUrl);
      const styleTag = `
        <style>
          body {
            background-image: url('${randomImageUrl}');
            background-size: cover;
            position: relative;
          }
          body::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.4); /* A value closer to 1 will make it darker, while a value closer to 0 will make it lighter.*/
            z-index: -1;
          }
        </style>`;

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
