import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { formatCellValue } from "@/helper/formatCellValue";
import "swiper/css";

type Row = Record<string, unknown>;
interface MembersTableProps {
  data: Row[];
  columns: string[];
}
const MembersTable = ({ data, columns }: MembersTableProps) => {
  const hasNameColumn = columns.some((col) =>
    ["name", "username", "Name", "Username"].includes(col)
  );
  const hasEmailColumn = columns.some((col) =>
    ["email", "Email"].includes(col)
  );

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mt-8">
      {data.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="w-full"
        >
          <SwiperSlide>
            <div className=" overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <Table className="w-[100%] min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead></TableHead> */}

                      {hasNameColumn && <TableHead>Avatar</TableHead>}
                      {columns.map((col, colIndex) => {
                        if (
                          hasNameColumn &&
                          hasEmailColumn &&
                          ["email", "Email"].includes(col)
                        ) {
                          return null;
                        }

                        if (
                          ["name", "username", "Name", "Username"].includes(col)
                        ) {
                          return (
                            <TableHead
                              className="border-t font-gilBold p-3 border-r white"
                              key={colIndex}
                            >
                              Person
                            </TableHead>
                          );
                        }

                        return (
                          <TableHead
                            className="border-t font-gilBold p-3 border-r"
                            key={colIndex}
                          >
                            {col}
                          </TableHead>
                        );
                      })}

                      {/* {columns.map((col, colIndex) => (
                    <TableHead
                      className="border-t font-gilBold p-3 border-r"
                      key={colIndex}
                    >
                      {col}
                    </TableHead>
                  ))} */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, rowIndex) => {
                      const name =
                        row["name"] ||
                        row["Name"] ||
                        row["username"] ||
                        row["Username"] ||
                        "Unknown User";

                      const email = row["email"] || row["Email"] || "No email";

                      return (
                        <TableRow key={rowIndex}>
                          <TableCell className="border-r font-gilRegular ">
                            <div className="flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-gilMedium">
                                {getInitials(String(name))}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="border-r font-gilRegular p-3">
                            <div className="">
                              <div className="font-medium">{String(name)}</div>
                              <div className="text-xs text-gray-500">
                                {String(email)}
                              </div>
                            </div>
                          </TableCell>

                          {columns
                            .filter(
                              (col) =>
                                ![
                                  "name",
                                  "username",
                                  "email",
                                  "Name",
                                  "Username",
                                  "Email",
                                ].includes(col)
                            )
                            .map((col, colIndex) => (
                              <TableCell
                                className="border-r font-gilRegular p-3"
                                key={colIndex}
                              >
                                {formatCellValue(row[col], col)}
                              </TableCell>
                            ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  );
};

export default MembersTable;
