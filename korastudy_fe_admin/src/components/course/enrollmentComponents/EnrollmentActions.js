// src/components/course/enrollmentComponents/EnrollmentActions.js
import React from "react";
import { Dropdown, Button, Menu } from "antd";
import {
  MoreOutlined,
  BarChartOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const EnrollmentActions = ({
  record = {},
  onViewProgressDetail = () => {},
  onViewQuizResults = () => {},
  onIssueCertificate = () => {},
}) => {
  const menu = (
    <Menu>
      <Menu.Item
        key="view-progress"
        icon={<BarChartOutlined />}
        onClick={() => onViewProgressDetail?.(record?.userId, record?.username)}
      >
        Xem chi tiết tiến độ
      </Menu.Item>
      <Menu.Item
        key="view-quiz"
        icon={<TrophyOutlined />}
        onClick={() => onViewQuizResults?.(record?.userId, record?.username)}
      >
        Xem kết quả quiz
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="issue-certificate"
        icon={<SafetyCertificateOutlined />}
        onClick={() =>
          onIssueCertificate?.(
            record?.userId,
            record?.username,
            record?.progress
          )
        }
      >
        Trao Certificate
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

export default EnrollmentActions;
