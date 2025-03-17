import { HTMLInputTypeAttribute } from "react";
import { FieldError } from "react-hook-form";
import { Label } from "@app/ui/components/label";
import { Input } from "@app/ui/components/input";

interface FormFieldProps {
    id: string;
    label?: string;
    type?: HTMLInputTypeAttribute;
    placeholder?: string;
    autoComplete?: string;
    error?: FieldError;
    description?: string;
    className?: string;
    registerProps: any; // This will be spread onto the input (result of register())
}

export function FormField({
    id,
    label,
    type = "text",
    placeholder,
    autoComplete,
    error,
    description,
    className = "",
    registerProps,
}: FormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && <Label htmlFor={id}>{label}</Label>}
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={error ? "border-red-300" : ""}
                {...registerProps}
            />
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-red-500 text-xs mt-1">{error.message}</p>
            )}
        </div>
    );
}