/**
 * Legacy Breadcrumb shim — delegates to antd Breadcrumb.
 * Pages that pass explicit breadcrumb items still work; if items is empty
 * the DashboardLayout breadcrumb bar already shows the page name.
 */
import { Breadcrumb as AntBreadcrumb } from "antd";
import { Link } from "wouter";
import { HomeOutlined } from "@ant-design/icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items.length) return null;

  const antItems = [
    {
      title: (
        <Link href="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...items.map((item, i) => ({
      title:
        item.href && i < items.length - 1 ? (
          <Link href={item.href}>{item.label}</Link>
        ) : (
          item.label
        ),
    })),
  ];

  return <AntBreadcrumb items={antItems} />;
}
