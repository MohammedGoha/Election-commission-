import { useEffect, useState } from "react";

type Candidate =
  | string
  | {
      name: string;
      bio: string;
      party: string;
      age: number;
      candidateName?: string;
    };

type Election = {
  electionId: string;
  electionName: string;
  candidates: Candidate[];
  voteTally: { [key: string]: number };
  startTime: string;
  endTime: string;
  electionDescription: string;
  eligibleGovernorates: string[] | string;
  electionStatus: string;
};

const ManageElection = () => {
  const [elections, setElections] = useState<Election[]>([]);

  const fetchElections = async () => {
    const res = await fetch("http://localhost:4000/elections");
    const data = await res.json();
    setElections(data);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("ar-EG");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">إدارة الانتخابات</h1>

      {elections
        .filter((e) => e.electionStatus !== "ended")
        .map((election) => (
          <div
            key={election.electionId}
            className="p-6 rounded-xl shadow-lg border border-gray-200 bg-white"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {election.electionName}
              </h2>
              <span
                className={`text-white px-3 py-1 rounded-full text-sm ${statusColor(
                  election.electionStatus
                )}`}
              >
                {election.electionStatus === "active"
                  ? "نشطة"
                  : election.electionStatus === "pending"
                  ? "قيد الانتظار"
                  : "منتهية"}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{election.electionDescription}</p>

            {/* Date Range */}
            <div className="mb-4">
              <span className="font-semibold">من: </span>
              {formatDate(election.startTime)} <br />
              <span className="font-semibold">إلى: </span>
              {formatDate(election.endTime)}
            </div>

            {/* Governorates */}
            <div className="mb-4">
              <span className="font-semibold">المحافظات:</span>{" "}
              {Array.isArray(election.eligibleGovernorates)
                ? election.eligibleGovernorates.join(" - ")
                : election.eligibleGovernorates}
            </div>

            {/* Candidates */}
            <div className="mb-4">
              <span className="font-semibold">المرشحون:</span>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                {election.candidates.map((candidate, index) => (
                  <li key={index}>
                    {typeof candidate === "string"
                      ? candidate
                      : `${candidate.name} (${candidate.party}, ${candidate.age} سنة)`}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vote Tally */}
            {election.voteTally && (
              <div>
                <span className="font-semibold">عدد الأصوات:</span>
                <ul className="pr-5 mt-2 space-y-1">
                  {Object.entries(election.voteTally).map(
                    ([candidate, votes], index) => (
                      <li key={index} className="text-blue-600 font-medium">
                        {candidate}: {votes} صوت
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}

      {elections.filter((e) => e.electionStatus !== "ended").length === 0 && (
        <p className="text-center text-gray-500">
          لا توجد انتخابات نشطة أو قيد الانتظار.
        </p>
      )}
    </div>
  );
};

export default ManageElection;
