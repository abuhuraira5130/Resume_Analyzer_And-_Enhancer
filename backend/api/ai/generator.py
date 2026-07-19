import io
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_resume_docx(content: dict) -> io.BytesIO:
    doc = Document()
    
    # Set standard page margins (0.75 in)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
    # Typography configuration (Calibri - highly readable/ATS friendly)
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x1E, 0x29, 0x3B) # Slate-800
    
    p_info = content.get("personalInformation", {})
    name = p_info.get("name", "Resume Owner")
    
    # Name Header
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_before = Pt(0)
    p_name.paragraph_format.space_after = Pt(2)
    run_name = p_name.add_run(name)
    run_name.bold = True
    run_name.font.size = Pt(20)
    run_name.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) # Slate-900
    
    # Contact Row
    contact_parts = []
    if p_info.get("email"): contact_parts.append(p_info["email"])
    if p_info.get("phone"): contact_parts.append(p_info["phone"])
    if p_info.get("location"): contact_parts.append(p_info["location"])
    if p_info.get("linkedin"): contact_parts.append(p_info["linkedin"])
    if p_info.get("github"): contact_parts.append(p_info["github"])
    if p_info.get("portfolio"): contact_parts.append(p_info["portfolio"])
    
    p_contact = doc.add_paragraph()
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_after = Pt(12)
    run_contact = p_contact.add_run("  |  ".join(contact_parts))
    run_contact.font.size = Pt(9.5)
    run_contact.font.color.rgb = RGBColor(0x47, 0x55, 0x69) # Slate-600
    
    def add_section_title(title: str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(title.upper())
        run.bold = True
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        
        # Add bottom border XML element to paragraph for professional underline effect
        pPr = p._p.get_or_add_pPr()
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
        pPr.append(pBdr)

    # 1. Professional Summary
    summary = content.get("professionalSummary")
    if summary:
        add_section_title("Professional Summary")
        p_sum = doc.add_paragraph(summary)
        p_sum.paragraph_format.space_after = Pt(8)
        p_sum.paragraph_format.line_spacing = 1.15
        
    # 2. Experience
    experience = content.get("experience", [])
    if experience:
        add_section_title("Work Experience")
        for exp in experience:
            p_job = doc.add_paragraph()
            p_job.paragraph_format.space_before = Pt(6)
            p_job.paragraph_format.space_after = Pt(2)
            p_job.paragraph_format.keep_with_next = True
            
            title = exp.get("jobTitle", "")
            company = exp.get("company", "")
            location = exp.get("location", "")
            start = exp.get("startDate", "")
            end = exp.get("endDate", "")
            
            r_title = p_job.add_run(title)
            r_title.bold = True
            r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            
            if company:
                r_comp = p_job.add_run(f" | {company}")
                r_comp.bold = False
                r_comp.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
                
            # Align dates to right using 7.0 inches tab stop
            p_job.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), alignment=2)
            date_str = f"{start} – {end}" if start or end else ""
            p_job.add_run(f"\t{date_str}")
            
            # Location Subline
            if location:
                p_loc = doc.add_paragraph()
                p_loc.paragraph_format.space_after = Pt(4)
                r_loc = p_loc.add_run(location)
                r_loc.italic = True
                r_loc.font.size = Pt(9.5)
                r_loc.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
                
            # Bullet highlights
            for hl in exp.get("highlights", []):
                p_hl = doc.add_paragraph(style='List Bullet')
                p_hl.paragraph_format.space_before = Pt(0)
                p_hl.paragraph_format.space_after = Pt(2.5)
                p_hl.paragraph_format.line_spacing = 1.1
                r_hl = p_hl.add_run(hl)
                r_hl.font.size = Pt(10)

    # 3. Education
    education = content.get("education", [])
    if education:
        add_section_title("Education")
        for edu in education:
            p_edu = doc.add_paragraph()
            p_edu.paragraph_format.space_before = Pt(6)
            p_edu.paragraph_format.space_after = Pt(2)
            
            degree = edu.get("degree", "")
            school = edu.get("school", "")
            loc = edu.get("location", "")
            grad = edu.get("graduationDate", "")
            gpa = edu.get("gpa", "")
            
            r_deg = p_edu.add_run(degree)
            r_deg.bold = True
            if school:
                p_edu.add_run(f", {school}")
                
            p_edu.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), alignment=2)
            p_edu.add_run(f"\t{grad}")
            
            if gpa or loc:
                p_gpa = doc.add_paragraph()
                p_gpa.paragraph_format.space_after = Pt(6)
                parts = []
                if loc: parts.append(loc)
                if gpa: parts.append(f"GPA: {gpa}")
                r_parts = p_gpa.add_run(", ".join(parts))
                r_parts.italic = True
                r_parts.font.size = Pt(9.5)
                r_parts.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # 4. Projects
    projects = content.get("projects", [])
    if projects:
        add_section_title("Projects")
        for proj in projects:
            p_proj = doc.add_paragraph()
            p_proj.paragraph_format.space_before = Pt(6)
            p_proj.paragraph_format.space_after = Pt(2)
            
            pname = proj.get("name", "")
            techs = ", ".join(proj.get("technologies", []))
            purl = proj.get("url", "")
            desc = proj.get("description", "")
            
            r_pname = p_proj.add_run(pname)
            r_pname.bold = True
            
            if techs:
                r_tech = p_proj.add_run(f" ({techs})")
                r_tech.font.size = Pt(9.5)
                r_tech.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
                
            if purl:
                p_proj.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), alignment=2)
                p_proj.add_run(f"\t{purl}")
                
            if desc:
                p_desc = doc.add_paragraph(desc)
                p_desc.paragraph_format.space_after = Pt(6)
                p_desc.paragraph_format.line_spacing = 1.15
                r_desc = p_desc.add_run()
                r_desc.font.size = Pt(10)

    # 5. Skills
    skills = content.get("skills", {})
    if skills:
        add_section_title("Skills")
        tech_skills = skills.get("technical", [])
        if not tech_skills and skills.get("all"):
            tech_skills = skills.get("all")
        if tech_skills:
            p_sk = doc.add_paragraph()
            p_sk.paragraph_format.space_after = Pt(4)
            p_sk.add_run("Technical Skills: ").bold = True
            p_sk.add_run(", ".join(tech_skills))
            
        soft_skills = skills.get("soft", [])
        if soft_skills:
            p_sk2 = doc.add_paragraph()
            p_sk2.paragraph_format.space_after = Pt(4)
            p_sk2.add_run("Soft Skills: ").bold = True
            p_sk2.add_run(", ".join(soft_skills))

    # 6. Certifications
    certs = content.get("certifications", [])
    if certs:
        add_section_title("Certifications")
        for cert in certs:
            p_cert = doc.add_paragraph()
            p_cert.paragraph_format.space_after = Pt(3)
            
            cname = cert.get("name", "")
            issuer = cert.get("issuer", "")
            cdate = cert.get("date", "")
            
            r_cname = p_cert.add_run(cname)
            r_cname.bold = True
            if issuer:
                p_cert.add_run(f" – {issuer}")
            if cdate:
                p_cert.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), alignment=2)
                p_cert.add_run(f"\t{cdate}")

    # 7. Languages
    languages = content.get("languages", [])
    if languages:
        add_section_title("Languages")
        p_lang = doc.add_paragraph(", ".join(languages))
        p_lang.paragraph_format.space_after = Pt(6)

    # Output buffer
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def generate_resume_pdf(content: dict) -> io.BytesIO:
    # Set up ReportLab Document
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54, # 0.75 in
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F172A") # Slate-900
    c_secondary = colors.HexColor("#334155") # Slate-700
    c_body = colors.HexColor("#1E293B") # Slate-800
    c_light = colors.HexColor("#64748B") # Slate-500
    c_border = colors.HexColor("#CBD5E1") # Slate-300
    
    # Custom styles
    style_name = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        alignment=1, # Center
        spaceAfter=4
    )
    
    style_contact = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=12,
        textColor=c_secondary,
        alignment=1, # Center
        spaceAfter=12
    )
    
    style_heading = ParagraphStyle(
        'ResumeHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=4,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_body,
        spaceAfter=8
    )
    
    style_bullet = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=c_body,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    style_job_title = ParagraphStyle(
        'ResumeJobTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=c_primary
    )
    
    style_job_dates = ParagraphStyle(
        'ResumeJobDates',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=12,
        textColor=c_secondary,
        alignment=2 # Right
    )
    
    story = []
    
    # 1. Name & Contact info
    p_info = content.get("personalInformation", {})
    name = p_info.get("name", "Resume Owner")
    story.append(Paragraph(name, style_name))
    
    contact_parts = []
    if p_info.get("email"): contact_parts.append(p_info["email"])
    if p_info.get("phone"): contact_parts.append(p_info["phone"])
    if p_info.get("location"): contact_parts.append(p_info["location"])
    if p_info.get("linkedin"): contact_parts.append(p_info["linkedin"])
    if p_info.get("github"): contact_parts.append(p_info["github"])
    if p_info.get("portfolio"): contact_parts.append(p_info["portfolio"])
    
    story.append(Paragraph("  |  ".join(contact_parts), style_contact))
    
    def add_section_header(title: str):
        story.append(Paragraph(title.upper(), style_heading))
        story.append(HRFlowable(
            width="100%",
            thickness=0.8,
            color=c_border,
            spaceBefore=0,
            spaceAfter=8
        ))

    # Professional Summary
    summary = content.get("professionalSummary")
    if summary:
        add_section_header("Professional Summary")
        story.append(Paragraph(summary, style_body))
        
    # Work Experience
    experience = content.get("experience", [])
    if experience:
        add_section_header("Work Experience")
        for exp in experience:
            title = exp.get("jobTitle", "")
            company = exp.get("company", "")
            location = exp.get("location", "")
            start = exp.get("startDate", "")
            end = exp.get("endDate", "")
            
            title_p = Paragraph(f"<b>{title}</b> | {company}", style_job_title)
            date_p = Paragraph(f"{start} – {end}", style_job_dates)
            
            # Left & Right aligned header using Table (504 total printable width)
            t = Table([[title_p, date_p]], colWidths=[384, 120])
            t.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(t)
            
            if location:
                loc_style = ParagraphStyle('Loc', parent=style_body, fontName='Helvetica-Oblique', fontSize=9, textColor=c_light, spaceAfter=4)
                story.append(Paragraph(location, loc_style))
                
            for hl in exp.get("highlights", []):
                story.append(Paragraph(f"&bull; {hl}", style_bullet))
                
            story.append(Spacer(1, 4))
            
    # Education
    education = content.get("education", [])
    if education:
        add_section_header("Education")
        for edu in education:
            degree = edu.get("degree", "")
            school = edu.get("school", "")
            loc = edu.get("location", "")
            grad = edu.get("graduationDate", "")
            gpa = edu.get("gpa", "")
            
            edu_p = Paragraph(f"<b>{degree}</b>, {school}", style_job_title)
            grad_p = Paragraph(grad, style_job_dates)
            
            t = Table([[edu_p, grad_p]], colWidths=[384, 120])
            t.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(t)
            
            if loc or gpa:
                parts = []
                if loc: parts.append(loc)
                if gpa: parts.append(f"GPA: {gpa}")
                sub_style = ParagraphStyle('EduSub', parent=style_body, fontName='Helvetica-Oblique', fontSize=9, textColor=c_light, spaceAfter=4)
                story.append(Paragraph(", ".join(parts), sub_style))

    # Projects
    projects = content.get("projects", [])
    if projects:
        add_section_header("Projects")
        for proj in projects:
            pname = proj.get("name", "")
            techs = ", ".join(proj.get("technologies", []))
            purl = proj.get("url", "")
            desc = proj.get("description", "")
            
            title_p = Paragraph(f"<b>{pname}</b> <font color='#64748B'>({techs})</font>", style_job_title)
            url_p = Paragraph(purl, style_job_dates)
            
            t = Table([[title_p, url_p]], colWidths=[384, 120])
            t.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(t)
            
            if desc:
                story.append(Paragraph(desc, style_body))

    # Skills
    skills = content.get("skills", {})
    if skills:
        add_section_header("Skills")
        tech_skills = skills.get("technical", [])
        if not tech_skills and skills.get("all"):
            tech_skills = skills.get("all")
        if tech_skills:
            story.append(Paragraph(f"<b>Technical Skills:</b> {', '.join(tech_skills)}", style_body))
            
        soft_skills = skills.get("soft", [])
        if soft_skills:
            story.append(Paragraph(f"<b>Soft Skills:</b> {', '.join(soft_skills)}", style_body))

    # Certifications
    certs = content.get("certifications", [])
    if certs:
        add_section_header("Certifications")
        for cert in certs:
            cname = cert.get("name", "")
            issuer = cert.get("issuer", "")
            cdate = cert.get("date", "")
            
            left_p = Paragraph(f"<b>{cname}</b>" + (f" – {issuer}" if issuer else ""), style_job_title)
            right_p = Paragraph(cdate, style_job_dates)
            
            t = Table([[left_p, right_p]], colWidths=[384, 120])
            t.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(t)

    # Languages
    languages = content.get("languages", [])
    if languages:
        add_section_header("Languages")
        story.append(Paragraph(", ".join(languages), style_body))

    # Build the document
    doc.build(story)
    buffer.seek(0)
    return buffer
