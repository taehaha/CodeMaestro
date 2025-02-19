import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import { getGroupStric } from "../../api/GroupApi";
import GroupStric from "./GroupStric";

function GroupTable({ members, groupId }) {
  const [groupStric, setGroupStric] = useState(null);

  useEffect(() => {
    const fetchStric = async () => {
      const result = await getGroupStric(groupId);
      setGroupStric(result);
    };

    fetchStric();
  }, [groupId]);

  // 테이블에 들어갈 데이터
  const data = React.useMemo(() => members, [members]);

  // 테이블에 표시할 컬럼들
  const columns = React.useMemo(() => {
    return [
      {
        Header: "프로필",
        accessor: "profileImageUrl",
        Cell: ({ row }) => (
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img
                src={
                  row.original.profileImageUrl ||
                  "https://via.placeholder.com/150"
                }
                alt="profile"
              />
            </div>
          </div>
        ),
      },
      {
        Header: "닉네임",
        accessor: "userNickname",
      },
      {
        Header: "역할",
        accessor: "role",
      },
      {
        Header: "회의 출석현황",
        Cell: ({ row }) => {
          const { userId } = row.original;

          // **중요**: 자식 컴포넌트로 groupStric 전체와 userId를 넘겨줍니다.
          // 자식 내부에서 userId에 맞는 attendanceStatus를 찾아 아이콘을 표시하게 됩니다.
          return (
            <GroupStric
              userId={userId}
              groupStric={groupStric} // 부모에서 가져온 결과를 그대로 전달
            />
          );
        },
      },
    ];
  }, [groupStric]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  return (
    <div className="overflow-x-auto">
      <table className="table w-full max-w-[1080px] mx-auto border mt-6" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => {
            const headerGroupProps = headerGroup.getHeaderGroupProps();
            const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroupProps;

            return (
              <tr key={headerGroupKey} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const headerProps = column.getHeaderProps();
                  const { key: headerKey, ...restHeaderProps } = headerProps;

                  return (
                    <th
                      key={headerKey}
                      className="bg-gray-100"
                      {...restHeaderProps}
                    >
                      {column.render("Header")}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const rowProps = row.getRowProps();
            const { key: rowKey, ...restRowProps } = rowProps;

            return (
              <tr key={rowKey} {...restRowProps} className="hover:bg-[#F5F5F5]">
                {row.cells.map((cell) => {
                  const cellProps = cell.getCellProps();
                  const { key: cellKey, ...restCellProps } = cellProps;

                  return (
                    <td key={cellKey} {...restCellProps}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default GroupTable;
