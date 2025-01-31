import React from "react";
import { useTable } from "react-table";
import Swal from "sweetalert2";

/**
 * @param {Array} members    - 그룹 멤버 배열 (예: [{ userId, name, profileUrl, role }, ...])
 * @param {string} userRole  - 현재 로그인 유저의 그룹 내 역할 (ADMIN, MEMBER 등)
 */
function GroupMembers({ members = [], userRole }) {
  const isAdmin = userRole === "ADMIN";

  // 유저 탈퇴 버튼 클릭 시 (실제 프로젝트에서는 API 호출)
  const handleRemoveMember = (userId) => {
    Swal.fire({
      title: "유저 탈퇴",
      icon: "warning",
      text: `정말로 ${userId}님에 대한 그룹 탈퇴 처리를 진행하시겠습니까?`,
      showCancelButton: true,
    });
  };

  // react-table에 전달할 데이터
  const data = React.useMemo(() => members, [members]);

  // react-table 컬럼 정의
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        Header: "프로필",
        accessor: "profileUrl",
        Cell: ({ row }) => (
          <div className="avatar">
            <div className="w-12 rounded-full ring-offset-base-100 ring-offset-2">
              <img
                src={
                  row.original.profileUrl ||
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
        accessor: "name",
      },
      {
        Header: "역할",
        accessor: "role",
      },
    ];

    if (isAdmin) {
      baseColumns.push({
        Header: "관리",
        id: "manage",
        Cell: ({ row }) => (
          <button
            className="text-gray-400"
            onClick={() => handleRemoveMember(row.original.userId)}
          >
            유저 탈퇴
          </button>
        ),
      });
      baseColumns.push({
        Header: "권한 설정",
        id: "grand",
        Cell: ({ row }) => (
          <button
            className="text-gray-400"
            onClick={() => handleRemoveMember(row.original.userId)}
          >
            권한 설정
          </button>
        ),
      });
    }

    return baseColumns;
  }, [isAdmin]);

  // react-table 훅
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  return (
    <div className="overflow-x-auto">
      {/* 테이블에 key를 따로 분리: */}
      {/** getTableProps()도 마찬가지로 key를 포함할 수 있으면 분리 필요 (대부분은 안 포함됨) */}
      <table className="table w-full border" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => {
            const headerGroupProps = headerGroup.getHeaderGroupProps();

            // (1) key만 추출
            const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroupProps;

            return (
              // (2) key와 나머지 props를 분리하여 전달
              <tr key={headerGroupKey} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const headerProps = column.getHeaderProps();

                  // (3) 마찬가지로 key 분리
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
        <tbody
          {...getTableBodyProps()}
        >
          {rows.map((row) => {
            prepareRow(row);

            // (4) row props에서 key 추출
            const rowProps = row.getRowProps();
            const { key: rowKey, ...restRowProps } = rowProps;

            return (
              // (5) key와 나머지를 분리하여 전달
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

export default GroupMembers;
