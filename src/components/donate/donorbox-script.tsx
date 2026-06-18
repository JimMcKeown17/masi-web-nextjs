'use client';
import { useEffect } from 'react';

// Loads DonorBox widget.js ONCE. Because this runs in useEffect (after the page
// has rendered), every <a class="dbox-donation-button"> already exists in the DOM
// when the script loads, so widget.js binds them as popup triggers and carries our
// amount/interval query params into the checkout iframe.
export default function DonorboxScript() {
  useEffect(() => {
    if (document.getElementById('donorbox-widget')) return;
    const script = document.createElement('script');
    script.id = 'donorbox-widget';
    script.src = 'https://donorbox.org/widget.js';
    script.setAttribute('paypalExpress', 'true');
    document.body.appendChild(script);
  }, []);
  return null;
}
