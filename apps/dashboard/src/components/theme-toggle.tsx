import { useTheme } from "@/lib/hooks/use-theme";
import { SunIcon, MoonIcon } from "lucide-react";
import { SidebarMenuButton } from "@app/ui/components/sidebar";

export function ThemeToggle() {
    const { toggleTheme, theme } = useTheme();

    return (
        <SidebarMenuButton
            onClick={toggleTheme}
            className="font-medium gap-3 h-8 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
        >
            {theme === 'light' ? (
                <SunIcon
                    className="text-muted-foreground/60"
                    size={16}
                    aria-hidden="true"
                />
            ) : (
                <MoonIcon
                    className="text-muted-foreground/60"
                    size={16}
                    aria-hidden="true"
                />
            )}
            <span>Theme</span>
        </SidebarMenuButton>
    );
}