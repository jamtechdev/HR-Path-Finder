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
                    background: #fffbeb !important;
                    color: #92400e !important;
                    border: 1px solid #f59e0b !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.18) !important;
                }
            `}</style>
        </>
    );
}
