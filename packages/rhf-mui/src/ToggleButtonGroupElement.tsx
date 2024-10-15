import {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
} from 'react-hook-form'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel, {FormLabelProps} from '@mui/material/FormLabel'
import ToggleButton, {ToggleButtonProps} from '@mui/material/ToggleButton'
import ToggleButtonGroup, {
  ToggleButtonGroupProps,
} from '@mui/material/ToggleButtonGroup'

import {MouseEvent, ReactNode} from 'react'
import {useFormError} from './FormErrorProvider'
import {useTransform} from './useTransform'

type SingleToggleButtonProps = Omit<
  ToggleButtonProps,
  'id' | 'value' | 'children'
> & {
  id: number | string
  label: ReactNode
}

export type ToggleButtonGroupElementProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue = unknown,
> = ToggleButtonGroupProps & {
  required?: boolean
  label?: string
  rules?: UseControllerProps<TFieldValues, TName>['rules']
  name: TName
  parseError?: (error: FieldError) => ReactNode
  control?: Control<TFieldValues>
  options: SingleToggleButtonProps[]
  formLabelProps?: FormLabelProps
  helperText?: string
  enforceAtLeastOneSelected?: boolean
  transform?: {
    input?: (value: PathValue<TFieldValues, TName>) => TValue
    output?: (...event: any[]) => PathValue<TFieldValues, TName>
  }
}

export default function ToggleButtonGroupElement<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TValue = unknown,
>(props: ToggleButtonGroupElementProps<TFieldValues, TName, TValue>) {
  const {
    name,
    control,
    label,
    rules = {},
    required,
    options = [],
    onBlur,
    parseError,
    helperText,
    formLabelProps,
    enforceAtLeastOneSelected = false,
    exclusive,
    transform,
    ...toggleButtonGroupProps
  } = props
  const errorMsgFn = useFormError()
  const customErrorFn = parseError || errorMsgFn

  const rulesTmp = {
    ...rules,
    ...(required &&
      !rules.required && {
        required: 'This field is required',
      }),
  }

  const isRequired = required || !!rules?.required

  const {
    field,
    fieldState: {error},
  } = useController({
    name,
    control,
    rules: rulesTmp,
    disabled: toggleButtonGroupProps.disabled,
  })

  const {value, onChange} = useTransform<TFieldValues, TName, TValue>({
    value: field.value,
    onChange: field.onChange,
    transform: {
      input: transform?.input,
      output:
        typeof transform?.output === 'function'
          ? transform.output
          : (_event: MouseEvent<HTMLElement, MouseEvent>, value: any) => {
              return value
            },
    },
  })

  const renderHelperText = error
    ? typeof customErrorFn === 'function'
      ? customErrorFn(error)
      : error.message
    : helperText

  return (
    <FormControl
      error={!!error}
      required={isRequired}
      fullWidth={toggleButtonGroupProps?.fullWidth}
    >
      {label && (
        <FormLabel
          {...formLabelProps}
          error={!!error}
          required={isRequired}
          sx={{mb: 1, ...formLabelProps?.sx}}
        >
          {label}
        </FormLabel>
      )}
      <ToggleButtonGroup
        {...toggleButtonGroupProps}
        exclusive={exclusive}
        value={value}
        onBlur={(event) => {
          field.onBlur()
          if (typeof onBlur === 'function') {
            onBlur(event)
          }
        }}
        onChange={(event, value) => {
          if (enforceAtLeastOneSelected) {
            // don't allow unselecting the last item
            if (exclusive && value === null) return
            if (!exclusive && value?.length === 0) return
          }
          onChange(event, value)
          if (typeof toggleButtonGroupProps.onChange === 'function') {
            toggleButtonGroupProps.onChange(event, value)
          }
        }}
      >
        {options.map(({label, id, ...toggleProps}) => (
          <ToggleButton value={id} {...toggleProps} key={id}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {renderHelperText && <FormHelperText>{renderHelperText}</FormHelperText>}
    </FormControl>
  )
}
