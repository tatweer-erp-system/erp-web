import { Button, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

type ActionDropdownProps = {
  items: MenuProps["items"];
};

/**
 * Standard action dropdown for table rows.
 * Renders a "..." button with a menu of actions.
 * stopPropagation prevents row click from firing.
 */
export function ActionDropdown({ items }: ActionDropdownProps) {
  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button
        type="text"
        icon={<MoreOutlined />}
        onClick={e => e.stopPropagation()}
      />
    </Dropdown>
  );
}
