import {
    Building2,
    MapPinned,
    Phone,
    Mail,
    UserRound,
    BedDouble,
} from "lucide-react";

function HospitalInfoCard({

    hospital,

    setHospital,

}) {

    const change = (key, value) => {

        setHospital(prev => ({

            ...prev,

            [key]: value,

        }));

    };

    return (

        <div className="hospital-card">

            <div className="hospital-card-header">

                <Building2 size={22} />

                <h2>병원 기본 정보</h2>

            </div>

            <div className="hospital-form">

                <label>

                    <Building2 size={18} />

                    <span>병원명</span>

                    <input

                        type="text"

                        placeholder="스마트요양병원"

                        value={hospital.name}

                        onChange={(e)=>

                            change(

                                "name",

                                e.target.value

                            )

                        }

                    />

                </label>

                <label>

                    <MapPinned size={18} />

                    <span>주소</span>

                    <input

                        type="text"

                        placeholder="대구광역시..."

                        value={hospital.address}

                        onChange={(e)=>

                            change(

                                "address",

                                e.target.value

                            )

                        }

                    />

                </label>

                <label>

                    <Phone size={18} />

                    <span>대표번호</span>

                    <input

                        type="text"

                        placeholder="053-000-0000"

                        value={hospital.phone}

                        onChange={(e)=>

                            change(

                                "phone",

                                e.target.value

                            )

                        }

                    />

                </label>

                <label>

                    <Mail size={18} />

                    <span>이메일</span>

                    <input

                        type="email"

                        placeholder="hospital@email.com"

                        value={hospital.email || ""}

                        onChange={(e)=>

                            change(

                                "email",

                                e.target.value

                            )

                        }

                    />

                </label>

                <label>

                    <UserRound size={18} />

                    <span>관리자</span>

                    <input

                        type="text"

                        placeholder="홍길동"

                        value={hospital.manager || ""}

                        onChange={(e)=>

                            change(

                                "manager",

                                e.target.value

                            )

                        }

                    />

                </label>

                <label>

                    <BedDouble size={18} />

                    <span>총 병상 수</span>

                    <input

                        type="number"

                        placeholder="120"

                        value={hospital.beds || ""}

                        onChange={(e)=>

                            change(

                                "beds",

                                Number(e.target.value)

                            )

                        }

                    />

                </label>

            </div>

        </div>

    );

}

export default HospitalInfoCard;