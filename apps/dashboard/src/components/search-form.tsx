import { Search } from "lucide-react";
import { Input } from "@app/ui/components/input";

interface SearchFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchForm({ value, onChange, ...props }: SearchFormProps) {
    return (
        <form onSubmit={(e) => e.preventDefault()} className="py-1 px-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-md bg-background pl-8 h-8 text-sm"
                    value={value}
                    onChange={onChange}
                    {...props}
                />
            </div>
        </form>
    );
}