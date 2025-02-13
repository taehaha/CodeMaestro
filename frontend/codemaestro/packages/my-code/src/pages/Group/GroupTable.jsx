import React, { useEffect } from "react";
import { useTable } from "react-table";
import Swal from "sweetalert2"; 
import { getGroupStric } from "../../api/GroupApi";
import GroupStric from "./GroupStric"; // GroupStric 컴포넌트 import

function GroupTable({ members, userRole, groupId }) {
  useEffect(() => {
    const fetchStric = async () => {
      const result = await getGroupStric(groupId);
      console.log(result);
    };

    fetchStric();
  }, [groupId]);

  const data = React.useMemo(() => members, [members]);

  const columns = React.useMemo(() => {
    return [
      {
        Header: "프로필",
        accessor: "profileImageUrl",
        Cell: ({ row }) => (
          <div className="avatar">
            <div className="w-12 rounded-full ring-offset-base-100 ring-offset-2">
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
        Header: "이름",
        accessor: "userNickname",
      },
      {
        Header: "역할",
        accessor: "role",
      },
      // ▼ 새로 추가한 컬럼 예시
      {
        Header: "그룹 스트릭",
        // accessor를 사용하지 않고, Cell을 직접 정의해도 무방합니다.
        Cell: ({ row }) => {
          // 필요한 데이터가 있다면 row.original에서 꺼낼 수 있습니다.
          const { userId } = row.original;
          return (
            <GroupStric
              userId={userId}
              groupId={groupId}
            />
          );
        },
      },
    ];
  }, [groupId]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  return (
    <div className="overflow-x-auto">
      <table className="table w-full border" {...getTableProps()}>
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
                      className="bg-base-200"
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
              <tr key={rowKey} {...restRowProps} className="hover">
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
