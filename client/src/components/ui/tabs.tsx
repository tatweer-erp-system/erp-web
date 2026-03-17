import * as React from "react";
import { Tabs as AntTabs } from "antd";
import { cn } from "@/lib/utils";

/**
 * Tabs — Ant Design Tabs wrapper preserving the shadcn/ui compound API:
 *
 *   <Tabs defaultValue="tab1">
 *     <TabsList>
 *       <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *       <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="tab1">Content 1</TabsContent>
 *     <TabsContent value="tab2">Content 2</TabsContent>
 *   </Tabs>
 *
 * Implementation: Tabs reads all children to build Ant Design tab items,
 * then renders a single <AntTabs>.
 */

type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
};

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}: {
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  dir?: string;
} & Omit<React.ComponentProps<"div">, "children">) {
  // Collect TabsTrigger items from TabsList, and TabsContent items
  const triggers: {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
  }[] = [];
  const contents: Record<string, React.ReactNode> = {};

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "tabs-list") {
      // Extract triggers from list children
      React.Children.forEach(p.children as React.ReactNode, trigger => {
        if (!React.isValidElement(trigger)) return;
        const tp = trigger.props as Record<string, unknown>;
        if (tp["data-slot"] === "tabs-trigger") {
          triggers.push({
            value: tp["data-value"] as string,
            label: tp.children as React.ReactNode,
            disabled: !!tp.disabled,
          });
        }
      });
    } else if (slot === "tabs-content") {
      const tabValue = p["data-value"] as string;
      contents[tabValue] = p.children as React.ReactNode;
    }
  });

  const tabItems: TabItem[] = triggers.map(t => ({
    key: t.value,
    label: t.label,
    children: contents[t.value] ?? null,
    disabled: t.disabled,
  }));

  return (
    <AntTabs
      activeKey={value}
      defaultActiveKey={defaultValue}
      onChange={onValueChange}
      items={tabItems}
      className={cn(className)}
    />
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="tabs-list" className={className} {...props}>
      {children}
    </div>
  );
}

function TabsTrigger({
  className,
  value,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  return (
    <button
      data-slot="tabs-trigger"
      data-value={value}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  return (
    <div
      data-slot="tabs-content"
      data-value={value}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
