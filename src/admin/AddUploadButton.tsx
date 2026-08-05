import LoaderButton from '@/components/primitives/LoaderButton';
import { addUploadAction } from '@/photo/actions';
import {
  generateLocalNaivePostgresString,
  generateLocalPostgresString,
} from '@/utility/date';
import { PATH_ADMIN_PHOTOS } from '@/app/path';
import { useRouter } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import IconAddUpload from '@/components/icons/IconAddUpload';

export default function AddUploadButton({
  url,
  title,
  onAddStart,
  onAddFinish,
  shouldRedirectToAdminPhotos,
  ...props
}: {
  url: string
  title?: string
  onAddStart?: () => void
  onAddFinish?: (success: boolean) => void
  shouldRedirectToAdminPhotos: boolean
} & ComponentProps<typeof LoaderButton>) {
  const router = useRouter();

  const [isAddingLocal, setIsAddingLocal] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <LoaderButton
      {...props}
      icon={<IconAddUpload />}
      onClick={() => {
        setError(undefined);
        onAddStart?.();
        setIsAddingLocal(true);
        addUploadAction({
          url,
          title,
          takenAtLocal: generateLocalPostgresString(),
          takenAtNaiveLocal: generateLocalNaivePostgresString(),
          shouldRevalidateAllKeysAndPaths: true,
        })
          .then(() => {
            if (shouldRedirectToAdminPhotos) {
              router.push(PATH_ADMIN_PHOTOS);
            } else {
              onAddFinish?.(true);
              setIsAddingLocal(false);
            }
          })
          .catch((error: Error) => {
            console.error('Could not add upload', error);
            setError(error.message || 'Could not add photo');
            onAddFinish?.(false);
            setIsAddingLocal(false);
          });
      }}
      isLoading={isAddingLocal}
      tooltip={error ?? 'Add directly'}
      hideText="never"
    >
      Add
    </LoaderButton>
  );
}
