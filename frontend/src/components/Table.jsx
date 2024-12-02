// import React, { useEffect, useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";
// import Paper from "@mui/material/Paper";
//
// // const rows = [
// //   { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
// //   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
// //   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
// //   { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
// //   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
// //   { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
// //   { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
// //   { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
// //   { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
// // ];
//
// const paginationModel = { page: 0, pageSize: 5 };
//
// export default function DataTable() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/users/");
//         const data = await response.json();
//
//         const formattedUsers = data.map((user) => ({
//           ...user,
//           id: user.id || user._id,
//         }));
//
//         setUsers(formattedUsers);
//       } catch (error) {
//         console.error("Error fetching users: ", error);
//       } finally {
//         setLoading(false);
//       }
//
//       //   setUsers(data);
//       // } catch (error) {
//       //   console.error("Error fetching users: ", error);
//       // } finally {
//       //   setLoading(false);
//       // }
//     };
//     fetchUsers();
//   }, []);
//
//   const columns = [
//     { field: "name", headerName: "Name", width: 150 },
//     { field: "email", headerName: "Email", width: 250 },
//     {
//       field: "last_login_time",
//       headerName: "Last Login",
//       width: 160,
//     },
//     { field: "status", headerName: "status", width: 100 },
//   ];
//
//   const handleBlockSelected = async () => {
//     if (selectedUsers.length === 0) {
//       alert("Please select at least one user");
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:5000/api/users/block", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids: selectedUsers }),
//       });
//       if (response.ok) {
//         alert("Selected users have been blocked");
//         setUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             selectedUsers.includes(user.id)
//               ? { ...user, status: "blocked" }
//               : user,
//           ),
//         );
//         setSelectedUsers([]); // Limpia la selección
//       } else {
//         alert("Failed to block users");
//       }
//     } catch (error) {
//       console.error("Error blocking users:", error);
//     }
//   };
//
//   const handleUnblockSelected = async () => {
//     if (selectedUsers.length === 0) {
//       alert("Please select at least one user");
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:5000/api/users/unblock", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids: selectedUsers }),
//       });
//       if (response.ok) {
//         alert("Selected users have been unblocked");
//         setUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             selectedUsers.includes(user.id)
//               ? { ...user, status: "active" }
//               : user,
//           ),
//         );
//         setSelectedUsers([]); // Limpia la selección
//       } else {
//         alert("Failed to unblock users");
//       }
//     } catch (error) {
//       console.error("Error unblocking users:", error);
//     }
//   };
//
//   const handleDeleteSelected = async () => {
//     if (selectedUsers.length === 0) {
//       alert("Please select at least one user");
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:5000/api/users", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids: selectedUsers }),
//       });
//       if (response.ok) {
//         alert("Selected users have been deleted");
//         setUsers((prevUsers) =>
//           prevUsers.filter((user) => !selectedUsers.includes(user.id)),
//         );
//         setSelectedUsers([]); // Limpia la selección
//       } else {
//         alert("Failed to delete users");
//       }
//     } catch (error) {
//       console.error("Error deleting users:", error);
//     }
//   };
//
//   return (
//     <>
//       <div className="flex mb-4">
//         <button
//           onClick={handleBlockSelected}
//           className="flex-no-wrap justify-items-center text-blue-500 border-2 rounded-2xl border-blue-500 pb-2 pt-3 px-4 mr-2"
//         >
//           <span>Block</span>
//           <LockClosedIcon
//             aria-hidden="true"
//             className="inline size-5 group-data-[open]:hidden"
//           ></LockClosedIcon>
//         </button>
//         <button
//           onClick={handleUnblockSelected}
//           className="flex-no-wrap justify-items-center text-blue-500 border-2 rounded-2xl border-blue-500 p-3 px-4 mr-2"
//         >
//           <LockOpenIcon
//             aria-hidden="true"
//             className="block size-5 group-data-[open]:hidden "
//           ></LockOpenIcon>
//         </button>
//         <button
//           onClick={handleDeleteSelected}
//           className="flex-no-wrap justify-items-center text-red-500 border-2 rounded-2xl border-red-500 p-3 px-4 mr-2"
//         >
//           <TrashIcon
//             aria-hidden="true"
//             className="block size-5 group-data-[open]:hidden "
//           ></TrashIcon>
//         </button>
//       </div>
//       <Paper sx={{ height: 600, width: "100%" }}>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <DataGrid
//             rows={users}
//             columns={columns}
//             // initialState={{ pagination: { paginationModel } }}
//             // pageSizeOptions={[5, 10]}
//             checkboxSelection
//             onSelectionModelChange={(ids) => {
//               console.log("Selected IDs: ", ids);
//               setSelectedUsers(ids);
//             }}
//           />
//         )}
//       </Paper>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  TablePagination,
} from "@mui/material";
import {
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export default function EnhancedTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API}api/users/`, {
          method: "GET",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedUsers = data.map((user) => ({
            ...user,
            id: user.id || user._id,
          }));
          setUsers(formattedUsers);
        } else if (response.status === 401) {
          console.error("Access denied. Redirecting to login...");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((user) => user.id);
      setSelectedUsers(newSelecteds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleClick = (id) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }

    setSelectedUsers(newSelected);
  };

  const handleAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    try {
      const url =
        action === "block"
          ? `${import.meta.env.VITE_API}api/users/block`
          : action === "unblock"
            ? `${import.meta.env.VITE_API}api/users/block`
            : `${import.meta.env.VITE_API}api/users`;

      const method = action === "delete" ? "DELETE" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      if (response.ok) {
        const updatedUsers =
          action === "block"
            ? users.map((user) =>
                selectedUsers.includes(user.id)
                  ? { ...user, status: "blocked" }
                  : user,
              )
            : action === "unblock"
              ? users.map((user) =>
                  selectedUsers.includes(user.id)
                    ? { ...user, status: "active" }
                    : user,
                )
              : users.filter((user) => !selectedUsers.includes(user.id));

        setUsers(updatedUsers);
        setSelectedUsers([]);
        alert(`Users have been ${action === "delete" ? "deleted" : action}`);
      } else {
        alert(`Failed to ${action} users`);
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedUsers.includes(id);

  return (
    <div>
      <div className="mb-4 flex">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "blue",
            color: "white",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          onClick={() => handleAction("block")}
          disabled={selectedUsers.length === 0}
        >
          Block
          <LockClosedIcon
            aria-hidden="true"
            className="inline size-5 ml-2 group-data-[open]:hidden"
          ></LockClosedIcon>
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "blue", // Botón azul
            color: "white",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          onClick={() => handleAction("unblock")}
          disabled={selectedUsers.length === 0}
          style={{ margin: "0 8px" }}
        >
          <LockOpenIcon
            aria-hidden="true"
            className="block size-5 group-data-[open]:hidden "
          ></LockOpenIcon>
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "red", // Botón rojo
            color: "white",
            "&:hover": {
              backgroundColor: "darkred", // Rojo más oscuro al pasar el cursor
            },
          }}
          className="text-red-500"
          onClick={() => handleAction("delete")}
          disabled={selectedUsers.length === 0}
        >
          <TrashIcon
            aria-hidden="true"
            className="block size-5 group-data-[open]:hidden "
          ></TrashIcon>
        </Button>
      </div>
      <Paper>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedUsers.length > 0 &&
                          selectedUsers.length < users.length
                        }
                        checked={
                          users.length > 0 &&
                          selectedUsers.length === users.length
                        }
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => {
                      const isItemSelected = isSelected(user.id);
                      return (
                        <TableRow
                          key={user.id}
                          selected={isItemSelected}
                          onClick={() => handleClick(user.id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} />
                          </TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.last_login_time}</TableCell>
                          <TableCell>{user.status}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </div>
  );
}
