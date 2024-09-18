import  { useEffect, useRef, memo } from 'react';
import { useInView } from 'react-intersection-observer';
//@ts-ignore
function TradingViewWidget({ symbol }) {
    const container = useRef();
    //@ts-ignore
    const { ref, inView } = useInView({
        triggerOnce: true, // Load the widget only once when it first comes into view
    });
    useEffect(() => {
       //@ts-ignore
            container.current.innerHTML = '';
            // const observer = new IntersectionObserver((entries) => {
            //     entries.forEach(entry => {
            //         if (entry.isIntersecting) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.innerHTML = JSON.stringify({
                symbol: symbol,
                width: '450',
                height: '250',
                locale: 'en',
                dateRange: '5D',
                colorTheme: 'light',
                trendLineColor: 'rgba(230, 145, 56, 1)',
                underLineColor: 'rgba(246, 178, 107, 1)',
                underLineBottomColor: 'rgba(249, 203, 156, 0)',
                isTransparent: false,
                autosize: true,
                noTimeScale: false,
            });//@ts-ignore
            container.current.appendChild(script);
            // observer.unobserve(container.current); // Stop observing once loaded
            //         }
            //     });
            // });

            // observer.observe(container.current);
            // return () => observer.disconnect(); // Cleanup observer on component unmount
        

    }, [symbol]);

    return (
        //@ts-ignore
        <div ref={container} >

        </div>
    );
}

export default memo(TradingViewWidget);
