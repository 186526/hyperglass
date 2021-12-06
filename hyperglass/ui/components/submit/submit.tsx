import { forwardRef } from 'react';
import {
  Modal,
  Popover,
  ModalBody,
  IconButton,
  PopoverBody,
  ModalOverlay,
  ModalContent,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  ModalCloseButton,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { DynamicIcon, If, ResolvedTarget } from '~/components';
import { useMobile, useColorValue } from '~/context';
import { useFormState } from '~/hooks';

import type { IconButtonProps } from '@chakra-ui/react';
import type { SubmitButtonProps, ResponsiveSubmitButtonProps } from './types';

const _SubmitIcon: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  Omit<IconButtonProps, 'aria-label'>
> = (props: Omit<IconButtonProps, 'aria-label'>, ref) => {
  const { isLoading, ...rest } = props;
  return (
    <IconButton
      ref={ref}
      size="lg"
      width={16}
      type="submit"
      icon={<DynamicIcon icon={{ fi: 'FiSearch' }} />}
      title="Submit Query"
      colorScheme="primary"
      isLoading={isLoading}
      aria-label="Submit Query"
      {...rest}
    />
  );
};
const SubmitIcon = forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'aria-label'>>(_SubmitIcon);

/**
 * Mobile Submit Button
 */
const MSubmitButton = (props: ResponsiveSubmitButtonProps): JSX.Element => {
  const { children, isOpen, onClose } = props;
  const bg = useColorValue('white', 'gray.900');
  return (
    <>
      {children}
      <Modal
        size="xs"
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent bg={bg}>
          <ModalCloseButton />
          <ModalBody px={4} py={10}>
            {isOpen && <ResolvedTarget errorClose={onClose} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

/**
 * Desktop Submit Button
 */
const DSubmitButton = (props: ResponsiveSubmitButtonProps): JSX.Element => {
  const { children, isOpen, onClose } = props;
  const bg = useColorValue('white', 'gray.900');
  return (
    <Popover isOpen={isOpen} onClose={onClose} closeOnBlur={false}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent bg={bg}>
        <PopoverArrow bg={bg} />
        <PopoverCloseButton />
        <PopoverBody p={6}>{isOpen && <ResolvedTarget errorClose={onClose} />}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export const SubmitButton = (props: SubmitButtonProps): JSX.Element => {
  const isMobile = useMobile();
  const loading = useFormState(s => s.loading);
  const {
    resolvedIsOpen,
    resolvedClose,
    reset: resetForm,
  } = useFormState(({ resolvedIsOpen, resolvedClose, reset }) => ({
    resolvedIsOpen,
    resolvedClose,
    reset,
  }));

  const { reset } = useFormContext();

  function handleClose(): void {
    reset();
    resetForm();
    resolvedClose();
  }

  return (
    <>
      <If c={isMobile}>
        <MSubmitButton isOpen={resolvedIsOpen} onClose={handleClose}>
          <SubmitIcon isLoading={loading} {...props} />
        </MSubmitButton>
      </If>
      <If c={!isMobile}>
        <DSubmitButton isOpen={resolvedIsOpen} onClose={handleClose}>
          <SubmitIcon isLoading={loading} {...props} />
        </DSubmitButton>
      </If>
    </>
  );
};
