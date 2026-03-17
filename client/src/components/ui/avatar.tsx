import * as React from "react";
import { Avatar as AntAvatar } from "antd";
import { cn } from "@/lib/utils";

/**
 * Avatar — Ant Design Avatar wrapper preserving the shadcn/ui API:
 *
 *   <Avatar>
 *     <AvatarImage src="..." alt="..." />
 *     <AvatarFallback>AB</AvatarFallback>
 *   </Avatar>
 *
 * Implementation: Avatar reads its children to find image src and
 * fallback text, then renders a single Ant <Avatar>.
 */

function Avatar({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  let src: string | undefined;
  let alt: string | undefined;
  let fallbackContent: React.ReactNode = null;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "avatar-image") {
      src = p.src as string | undefined;
      alt = p.alt as string | undefined;
    } else if (slot === "avatar-fallback") {
      fallbackContent = p.children as React.ReactNode;
    }
  });

  return (
    <AntAvatar
      src={src}
      alt={alt}
      className={cn("flex items-center justify-center", className)}
      {...(props as Record<string, unknown>)}
    >
      {fallbackContent}
    </AntAvatar>
  );
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span data-slot="avatar-fallback" className={className} {...props}>
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
