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

const ElectionResults = () => {
  const [elections, setElections] = useState<Election[]>([]);

  const fetchElections = async () => {
    const res = await fetch("http://localhost:4000/elections");
    const data = await res.json();
    setElections(data);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString("ar-EG");

  const publishElection = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/publish/${id}`, {
        method: "POST",
      });
      if (res.ok) {
        alert("تم نشر الانتخابات بنجاح!");
      } else {
        alert("فشل النشر.");
      }
    } catch (error) {
      alert("حدث خطأ أثناء محاولة النشر.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">نشر الانتخابات</h1>

      {elections
        .filter((e) => e.electionStatus === "ended")
        .map((election) => (
          <div
            key={election.electionId}
            className="p-6 rounded-xl shadow-lg border border-gray-200 bg-white"
          >
            <h2 className="text-2xl font-semibold mb-4">
              {election.electionName}
            </h2>
            <p className="text-gray-600 mb-4">{election.electionDescription}</p>

            <div className="mb-4">
              <span className="font-semibold">من: </span>
              {formatDate(election.startTime)} <br />
              <span className="font-semibold">إلى: </span>
              {formatDate(election.endTime)}
            </div>

            <div className="mb-4">
              <span className="font-semibold">المحافظات:</span>{" "}
              {Array.isArray(election.eligibleGovernorates)
                ? election.eligibleGovernorates.join(" - ")
                : election.eligibleGovernorates}
            </div>

            <div className="mb-4">
              <span className="font-semibold">المرشحون:</span>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                {election.candidates.map((candidate, index) => (
                  <li key={index}>
                    {typeof candidate === "string"
                      ? candidate
                      : `${candidate.name}`}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <span className="font-semibold">عدد الأصوات:</span>
              <ul className="pr-5 mt-2 space-y-1">
                {/* {Object.entries(election.voteTally)} */}
                {Object.entries(election.voteTally).map(
                  ([candidate, votes], index) => (
                    <>
                      <li key={index} className="text-blue-600 font-medium">
                        {candidate}: {votes} صوت
                      </li>
                      <h1>{}</h1>
                    </>
                  )
                )}
              </ul>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full mt-4"
              onClick={() => publishElection(election.electionId)}
            >
              نشر النتيجة
            </button>
          </div>
        ))}

      {elections.filter((e) => e.electionStatus === "ended").length === 0 && (
        <p className="text-center text-gray-500">لا توجد انتخابات منتهية.</p>
      )}
    </div>
  );
};

export default ElectionResults;