import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const { t, i18n } = useTranslation();
    const passwordInput = useRef<HTMLInputElement>(null);
    const isKo = (i18n.resolvedLanguage || i18n.language || '').startsWith('ko');

    const tr = (key: string, en: string, ko: string) => {
        const resolved = t(key);

        // Force Korean copy when KO mode is active but runtime translations
        // are stale/overridden and still return English.
        if (isKo && (resolved === key || resolved === en)) {
            return ko;
        }

        if (!isKo && (resolved === key || resolved === ko)) {
            return en;
        }

        return resolved;
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={tr('settings_delete_account.heading_title', 'Delete account', '계정 삭제')}
                description={tr('settings_delete_account.heading_description', 'Delete your account and all of its resources', '계정과 모든 리소스를 삭제합니다')}
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">{tr('settings_delete_account.warning_title', 'Warning', '경고')}</p>
                    <p className="text-sm">
                        {tr('settings_delete_account.warning_body', 'Please proceed with caution, this cannot be undone.', '이 작업은 되돌릴 수 없으니 주의해서 진행해 주세요.')}
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            {tr('settings_delete_account.delete_button', 'Delete account', '계정 삭제')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            {tr('settings_delete_account.confirm_title', 'Are you sure you want to delete your account?', '정말로 계정을 삭제하시겠습니까?')}
                        </DialogTitle>
                        <DialogDescription>
                            {tr('settings_delete_account.confirm_description', 'Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.', '계정이 삭제되면 관련된 모든 리소스와 데이터도 영구적으로 삭제됩니다. 계정을 영구 삭제하려면 비밀번호를 입력해 확인해 주세요.')}
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            {tr('settings_delete_account.password_label', 'Password', '비밀번호')}
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder={tr('settings_delete_account.password_placeholder', 'Password', '비밀번호')}
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                {tr('settings_delete_account.cancel_button', 'Cancel', '취소')}
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                {tr('settings_delete_account.delete_button', 'Delete account', '계정 삭제')}
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
