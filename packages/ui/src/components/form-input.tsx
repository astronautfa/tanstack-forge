import { forwardRef, type HTMLInputTypeAttribute } from "react";
import { Input } from "@app/ui/components/input";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@app/ui/components/form";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    placeholder?: string;
    description?: string;
    type?: HTMLInputTypeAttribute;
    className?: string;
    autoComplete?: string;
}

export const FormInput = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    label,
    placeholder,
    description,
    type = "text",
    className,
    autoComplete,
    ...props
}: FormInputProps<TFieldValues, TName>) => {
    return (
        <FormField
            control={control}
            name={name}
            {...props}
            render={({ field, fieldState }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input
                            {...field}
                            value={field.value ?? ""}
                            type={type}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            className={fieldState.error ? "border-red-300" : ""}
                        />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};