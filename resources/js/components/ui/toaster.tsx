import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Toaster() {
    return (
        <>
            <ToastContainer
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                pauseOnHover
                draggable
                theme="colored"
                position="top-right"
                toastStyle={{ marginTop: 'calc(var(--hr-topbar-h, 52px) + 12px)' }}
            />
            <style>{`
                .toast-warning-emphasis {
                    background: #fef08a !important;
                    color: #78350f !important;
                    border: 2px solid #facc15 !important;
                    font-weight: 800 !important;
                    font-size: 16px !important;
                    line-height: 1.35 !important;
                    box-shadow: 0 10px 24px rgba(250, 204, 21, 0.35) !important;
                }
            `}</style>
        </>
    );
}
